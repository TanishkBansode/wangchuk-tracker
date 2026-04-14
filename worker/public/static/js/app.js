const API_BASE = '/api';
const GITHUB_URL = 'https://github.com/TanishkBansode/wangchuk-tracker';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

// Topics config (display names + IDs)
const TOPICS = [
    { id: 'wangchuk', label: '🏔️ Sonam Wangchuk' },
    { id: 'iran_israel_war', label: '⚔️ Iran-Israel-America War' },
    { id: 'lpg_shortage_india', label: '🔥 LPG Shortage India' },
];

// State
const state = {
    activeTopic: 'wangchuk',
    articles: [],
    error: null,
};

// ─── LocalStorage Cache ───────────────────────────────────────────────────────

function cacheKey(topicId) {
    return `wt_articles_${topicId}`;
}

function saveToCache(topicId, articles) {
    try {
        localStorage.setItem(cacheKey(topicId), JSON.stringify({
            ts: Date.now(),
            data: articles,
        }));
    } catch (e) {
        // Storage full or unavailable — silently ignore
    }
}

function loadFromCache(topicId) {
    try {
        const raw = localStorage.getItem(cacheKey(topicId));
        if (!raw) return null;
        const { ts, data } = JSON.parse(raw);
        if (Date.now() - ts > CACHE_TTL_MS) {
            localStorage.removeItem(cacheKey(topicId));
            return null;
        }
        return data;
    } catch (e) {
        return null;
    }
}

// ─── Initialize ───────────────────────────────────────────────────────────────

window.addEventListener('load', init);

async function init() {
    await fetchArticles(state.activeTopic);
    render();
}

// ─── API Call ─────────────────────────────────────────────────────────────────

async function fetchArticles(topicId, forceRefresh = false) {
    state.error = null;

    // Try cache first unless forced refresh
    if (!forceRefresh) {
        const cached = loadFromCache(topicId);
        if (cached) {
            console.log(`✅ Cache hit for "${topicId}" (${cached.length} articles)`);
            state.articles = cached;
            return;
        }
    }

    try {
        const res = await fetch(`${API_BASE}/articles?topic=${topicId}`);
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const articles = await res.json();
        state.articles = articles;
        saveToCache(topicId, articles);
    } catch (e) {
        console.error('Failed to fetch articles', e);
        state.articles = [];
        state.error = e.message;
    }
}

// ─── Switch Topic ─────────────────────────────────────────────────────────────

async function switchTopic(topicId) {
    if (state.activeTopic === topicId) return;
    state.activeTopic = topicId;
    state.articles = [];
    state.error = null;
    renderSkeleton();
    await fetchArticles(topicId);
    renderTimeline();
    // Update tab highlights without full re-render
    document.querySelectorAll('[data-topic-btn]').forEach(btn => {
        const isActive = btn.dataset.topicBtn === topicId;
        btn.className = `px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
            isActive ? 'bg-white text-indigo-700 shadow-lg scale-105' : 'bg-white/20 text-white hover:bg-white/30'
        }`;
    });
    // Update article count
    const countEl = document.getElementById('article-count');
    if (countEl) {
        const activeTopic = TOPICS.find(t => t.id === topicId);
        countEl.innerHTML = `${state.articles.length} updates on <span class="font-semibold text-white/80">${activeTopic?.label}</span>`;
    }
}

// ─── Refresh (force network) ──────────────────────────────────────────────────

async function refreshTopic() {
    renderSkeleton();
    await fetchArticles(state.activeTopic, true);
    renderTimeline();
}

// ─── Rendering ────────────────────────────────────────────────────────────────

const main = document.getElementById('app');

function renderSkeleton() {
    const timeline = document.getElementById('timeline');
    if (timeline) {
        timeline.innerHTML = `
            ${Array(3).fill(0).map(() => `
                <div class="glass-card h-32 rounded-xl animate-pulse mb-4"></div>
            `).join('')}
        `;
    }
}

function renderTimeline() {
    const timeline = document.getElementById('timeline');
    if (!timeline) return;

    if (state.error) {
        timeline.innerHTML = `
            <div class="text-center py-12">
                <div class="text-5xl mb-4">⚠️</div>
                <p class="text-white/70 text-sm mb-4">Could not load articles: ${state.error}</p>
                <button onclick="refreshTopic()" class="px-4 py-2 rounded-full bg-white/20 text-white text-sm hover:bg-white/30 transition">
                    Try Again
                </button>
            </div>
        `;
        return;
    }

    if (state.articles.length === 0) {
        timeline.innerHTML = `
            <div class="text-center text-white/60 py-12">No updates found yet.</div>
        `;
        return;
    }

    timeline.innerHTML = state.articles.map((item, i) => `
        <div class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group animate-fade-in">
            <!-- Icon -->
            <div class="absolute left-4 md:left-1/2 w-8 h-8 rounded-full border-4 border-slate-200 bg-white shadow shrink-0 -translate-x-1/2 flex items-center justify-center z-10 text-xs font-bold text-slate-500">
               ${i + 1}
            </div>
            
            <!-- Card -->
            <div class="ml-10 md:ml-0 w-[calc(100%-3.5rem)] md:w-[calc(50%-2rem)] glass-card p-6 rounded-2xl relative hover:scale-[1.01] transition-transform duration-300">
                 <div class="flex justify-between items-start mb-3">
                    <span class="text-xs font-bold px-2 py-0.5 rounded ${getPriorityClass(item.priority)}">
                        ${item.priority || 'Medium'}
                    </span>
                    <time class="text-xs text-slate-500 font-medium font-mono">${item.date}</time>
                </div>
                <h3 class="text-lg font-bold text-slate-800 mb-2 leading-tight">
                    <a href="${item.sources?.[0]?.link || '#'}" target="_blank" class="hover:text-indigo-600 transition">
                        ${item.title}
                    </a>
                </h3>
                <p class="text-slate-600 text-sm leading-relaxed mb-4">
                    ${item.summary}
                </p>
                <div class="flex flex-wrap gap-2 pt-3 border-t border-slate-100/50">
                    ${(item.sources || []).map(s => `
                        <a href="${s.link}" target="_blank" class="text-xs flex items-center space-x-1 px-2 py-1 rounded bg-slate-50 border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600 transition text-slate-500">
                            <span>${s.source}</span>
                            <span class="opacity-50">↗</span>
                        </a>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

function render() {
    const activeTopic = TOPICS.find(t => t.id === state.activeTopic);

    main.innerHTML = `
        <div class="animate-fade-in max-w-4xl mx-auto px-4 py-8 pb-20">
            <!-- Header -->
            <div class="text-center mb-8">
                <h1 class="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-md">
                    News Tracker
                </h1>
                <p class="text-white/70 text-sm">
                    AI-powered news summaries, updated hourly
                </p>
            </div>

            <!-- Topic Tabs -->
            <div class="flex flex-wrap gap-2 justify-center mb-10">
                ${TOPICS.map(t => `
                    <button 
                        data-topic-btn="${t.id}"
                        onclick="switchTopic('${t.id}')"
                        class="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                            state.activeTopic === t.id
                                ? 'bg-white text-indigo-700 shadow-lg scale-105'
                                : 'bg-white/20 text-white hover:bg-white/30'
                        }"
                    >
                        ${t.label}
                    </button>
                `).join('')}
            </div>

            <!-- Article count + refresh -->
            <div class="flex items-center justify-center gap-3 text-white/60 text-sm mb-8">
                <span id="article-count">${state.articles.length} updates on <span class="font-semibold text-white/80">${activeTopic?.label}</span></span>
                <button onclick="refreshTopic()" title="Force refresh from server" class="opacity-50 hover:opacity-100 transition text-lg leading-none" aria-label="Refresh">↻</button>
            </div>

            <!-- Timeline -->
            <div class="relative space-y-6">
                <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-white/30 md:left-1/2 md:-ml-0.5"></div>
                <div id="timeline">
                    <!-- articles rendered here -->
                </div>
            </div>
        </div>

        <!-- Footer -->
        <footer class="fixed bottom-0 left-0 right-0 bg-black/30 backdrop-blur-md border-t border-white/10 py-3 px-4 text-center z-50">
            <p class="text-white/60 text-xs">
                Want to add a topic? 
                <a href="${GITHUB_URL}/issues/new" target="_blank" class="text-indigo-300 hover:text-indigo-200 font-semibold underline underline-offset-2">Raise an issue</a>
                or
                <a href="${GITHUB_URL}/compare" target="_blank" class="text-indigo-300 hover:text-indigo-200 font-semibold underline underline-offset-2">open a pull request</a>
                on
                <a href="${GITHUB_URL}" target="_blank" class="text-white/80 hover:text-white font-semibold">GitHub ↗</a>
            </p>
        </footer>
    `;

    renderTimeline();
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPriorityClass(priority) {
    switch (priority) {
        case 'High': return 'bg-red-100 text-red-700';
        case 'Medium': return 'bg-blue-100 text-blue-700';
        case 'Low': return 'bg-slate-100 text-slate-700';
        default: return 'bg-slate-100 text-slate-700';
    }
}
