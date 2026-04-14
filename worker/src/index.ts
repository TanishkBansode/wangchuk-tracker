import { Hono } from 'hono';
import { serveStatic } from 'hono/cloudflare-workers';
import { cors } from 'hono/cors';
import { createClient } from '@libsql/client';
import topicPayload from './topics_vectors.json';
// @ts-ignore
import manifest from '__STATIC_CONTENT_MANIFEST';

// Types
type Bindings = {
    TURSO_DB_URL: string;
    TURSO_DB_TOKEN: string;
    GEMINI_API_KEY: string;
    MODEL_ID: string;
    EMBEDDING_MODEL: string;
};

type Topic = {
    page_id: string;
    page_title: string;
    topic_name: string;
    query: string;
};

// Initialize App
const app = new Hono<{ Bindings: Bindings }>();

// Middleware
app.use('/*', cors());

// Database Helper
const getDb = (c: any) => {
    return createClient({
        url: c.env.TURSO_DB_URL,
        authToken: c.env.TURSO_DB_TOKEN,
    });
};

// --- Routes ---

// 1. Get Topics Summary
app.get('/api/topics', async (c) => {
    const db = getDb(c);
    try {
        const result = await db.execute(`
      SELECT 
        page_id, 
        COUNT(*) as count, 
        MAX(date) as latest_date 
      FROM articles 
      GROUP BY page_id
      ORDER BY latest_date DESC
    `);

        // Map to nice JSON
        const topics = result.rows.map((row: any) => ({
            page_id: row.page_id,
            count: row.count,
            latest_date: row.latest_date
        }));

        return c.json(topics);
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// 2. Get Articles
app.get('/api/articles', async (c) => {
    const db = getDb(c);
    const topic = c.req.query('topic');
    const date = c.req.query('date');
    const limit = c.req.query('limit') || '100';

    let query = "SELECT id, date, page_id, title, summary, priority, type FROM articles";
    const params: any[] = [];
    const conditions: string[] = [];

    if (date) {
        conditions.push("date = ?");
        params.push(date);
    }

    if (topic) {
        conditions.push("page_id = ?");
        params.push(topic);
    }

    if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY date DESC LIMIT ?";
    params.push(parseInt(limit as string));

    try {
        const result = await db.execute({ sql: query, args: params });
        if (result.rows.length === 0) return c.json([]);

        // Single JOIN query for all sources — avoids N+1 problem
        const articleIds = result.rows.map((r: any) => r.id);
        const placeholders = articleIds.map(() => '?').join(', ');
        const sourcesRes = await db.execute({
            sql: `SELECT article_id, link, original_link, source FROM sources WHERE article_id IN (${placeholders})`,
            args: articleIds
        });

        // Group sources by article_id
        const sourcesByArticle = new Map<number, any[]>();
        for (const s of sourcesRes.rows as any[]) {
            const aid = s.article_id as number;
            if (!sourcesByArticle.has(aid)) sourcesByArticle.set(aid, []);
            sourcesByArticle.get(aid)!.push({
                link: s.link,
                original_link: s.original_link,
                source: s.source,
            });
        }

        const articles = result.rows.map((row: any) => ({
            id: row.id,
            date: row.date,
            page_id: row.page_id,
            title: row.title,
            summary: row.summary,
            priority: row.priority,
            type: row.type,
            sources: sourcesByArticle.get(row.id as number) || [],
        }));

        return c.json(articles);
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// 3. Search (Vector + AI)
app.get('/api/search', async (c) => {
    const q = c.req.query('q');
    const mode = c.req.query('mode') || 'semantic';

    if (!q) return c.json([]);

    // Load topics
    const topics = topicPayload.topics as Topic[];

    // A. Simple Search (Title/ID match) - Fast, for autocomplete
    if (mode === 'simple') {
        const query = q.toLowerCase();
        const results = topics.map(t => {
            let score = 0;
            const tName = t.topic_name.toLowerCase();
            const pTitle = t.page_title.toLowerCase();

            if (tName === query || pTitle === query) score = 1.0;
            else if (tName.includes(query) || pTitle.includes(query)) score = 0.8;
            else if (query.split(' ').some(w => tName.includes(w))) score = 0.5;

            return {
                page_id: t.page_id,
                title: t.topic_name,
                score: score,
                summary: `Topic: ${t.topic_name}`
            };
        })
            .filter(r => r.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);

        return c.json(results);
    }

    // B. Semantic Search (Topic Matching)
    try {
        // 1. Embed the query using Gemini REST API
        const apiKey = c.env.GEMINI_API_KEY;
        const model = c.env.EMBEDDING_MODEL || "models/text-embedding-004";

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${model}:embedContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                content: { parts: [{ text: q }] }
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API Error: ${response.statusText}`);
        }

        const data: any = await response.json();
        const queryEmbedding = data.embedding.values; // Array of floats

        // 2. Cosine Similarity against pre-calculated topics
        const topicEmbeddings = topicPayload.embeddings as number[][];

        const results = topics.map((topic, i) => {
            const topicVec = topicEmbeddings[i];
            const score = cosineSimilarity(queryEmbedding, topicVec);
            return {
                page_id: topic.page_id,
                title: topic.topic_name,
                score: score,
                summary: `News about ${topic.topic_name}`
            };
        })
            .filter(r => r.score > 0.4) // Threshold
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);

        return c.json(results);

    } catch (e: any) {
        console.error(e);
        return c.json({ error: "Search failed" }, 500);
    }
});

// Helper: Cosine Similarity
function cosineSimilarity(vecA: number[], vecB: number[]) {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magA * magB);
}

// 4. Static Files (Frontend)
app.get('/*', serveStatic({
    root: './',
    manifest,
    rewriteRequestPath: (path) => {
        // If it's the root, serve index.html
        if (path === '/') return '/index.html';
        // If it's a file path (has extension), keep it
        if (path.includes('.')) return path;
        // Otherwise serve index.html (SPA Fallback)
        return '/index.html';
    }
}));

export default app;
