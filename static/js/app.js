const API_BASE = '/api';

// State
const state = {
    topics: [],
    currentTopic: null,
    articles: [],
    searchQuery: ''
};

// Routing
function handleRoute() {
    const hash = window.location.hash || '#home';
    const [route, param] = hash.slice(1).split('/');

    if (route === 'home') {
        renderHome();
    } else if (route === 'topic' && param) {
        renderTopic(param);
    } else {
        window.location.hash = '#home'; // Default
    }
}

window.addEventListener('hashchange', handleRoute);
window.addEventListener('load', init);

async function init() {
    await fetchTopics();
    handleRoute();
}

// API Calls
async function fetchTopics() {
    try {
        const res = await fetch(`${API_BASE}/topics`);
        state.topics = await res.json();
    } catch (e) {
        console.error("Failed to fetch topics", e);
    }
}

async function fetchArticles(topicId) {
    try {
        const res = await fetch(`${API_BASE}/articles?topic=${topicId}`);
        state.articles = await res.json();
    } catch (e) {
        console.error("Failed to fetch articles", e);
    }
}

// Rendering
const main = document.getElementById('app');

function renderHome() {
    main.innerHTML = `
        <div class="animate-fade-in max-w-5xl mx-auto px-6 py-12">
            <!-- Hero / Search -->
            <div class="text-center mb-16">
                <h1 class="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-md">
                    🏔️ Sonam Wangchuk<br><span class="text-2xl md:text-3xl font-normal opacity-90">News Tracker</span>
                </h1>
                <p class="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
                    Stay updated with the latest news about Sonam Wangchuk, engineer, innovator, and education reformist from Ladakh.
                </p>
                <div class="relative max-w-2xl mx-auto group">
                    <div class="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                    <input 
                        type="text" 
                        id="searchInput"
                        placeholder="Search news about Sonam Wangchuk..." 
                        class="relative w-full px-6 py-4 rounded-full bg-white/90 backdrop-blur text-slate-800 placeholder-slate-400 border-none outline-none shadow-lg focus:ring-2 focus:ring-purple-500/50 transition text-lg"
                        oninput="handleSearch(this.value)"
                    >
                    <div id="searchResults" class="absolute w-full mt-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 hidden z-50 overflow-hidden text-left">
                        <!-- Search Results -->
                    </div>
                </div>
            </div>

            <!-- Topic Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${state.topics.map((t, i) => `
                    <a href="#topic/${t.page_id}" class="glass-card p-6 rounded-2xl flex flex-col justify-between h-48 block group animate-fade-in stagger-${Math.min(i + 1, 4)}">
                        <div>
                            <div class="flex justify-between items-start mb-4">
                                <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-xl shadow-inner">
                                    ${getEmoji(t.page_id)}
                                </div>
                                <span class="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    ${t.count} Updates
                                </span>
                            </div>
                            <h2 class="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition truncate">
                                ${formatTitle(t.page_id)}
                            </h2>
                        </div>
                        <div class="flex justify-between items-end">
                            <span class="text-xs text-slate-500 font-medium">
                                Last update: ${t.latest_date || 'N/A'}
                            </span>
                            <span class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition">
                                →
                            </span>
                        </div>
                    </a>
                `).join('')}
            </div>
        </div>
    `;

    // Re-attach Enter key listener for Search since DOM was replaced
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keydown', async (e) => {
            if (e.key === 'Enter') {
                clearTimeout(searchTimeout);
                const query = searchInput.value;
                if (query.trim()) {
                    const resultsContainer = document.getElementById('searchResults');
                    resultsContainer.innerHTML = `<div class="p-4 text-sm text-slate-500 text-center animate-pulse">Running smart search...</div>`;
                    resultsContainer.classList.remove('hidden');

                    await performSearch(query, 'semantic');
                }
            }
        });
    }
}

async function renderTopic(topicId) {
    const topic = state.topics.find(t => t.page_id === topicId) || { page_id: topicId, count: 0 };

    // Skeleton Loading
    main.innerHTML = `
        <div class="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
            <div class="flex items-center space-x-4 mb-8">
                <a href="#home" class="p-2 rounded-full hover:bg-white/20 text-white transition">← Back</a>
                <h1 class="text-3xl font-bold text-white shadow-sm">${formatTitle(topicId)}</h1>
            </div>
            <div class="space-y-4">
               ${Array(3).fill(0).map(() => `
                   <div class="glass-card h-32 rounded-xl animate-pulse"></div>
               `).join('')}
            </div>
        </div>
    `;

    await fetchArticles(topicId);

    main.innerHTML = `
        <div class="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
            <!-- Header -->
            <div class="sticky top-0 z-40 py-4 -mx-4 px-4 bg-slate-900/0 backdrop-blur-none transition-all duration-300" id="topicHeader">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <a href="#home" class="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur transition shadow-sm">
                            ←
                        </a>
                        <div>
                            <h1 class="text-2xl font-bold text-white drop-shadow-sm leading-none">${formatTitle(topicId)}</h1>
                            <span class="text-white/80 text-sm font-medium">${state.articles.length} timeline entries</span>
                        </div>
                    </div>
                    <button onclick="fetchArticles('${topicId}').then(() => renderTopic('${topicId}'))" class="text-white/80 hover:text-white text-sm font-medium">
                        Refresh ↻
                    </button>
                </div>
            </div>

            <!-- Timeline -->
            <div class="relative space-y-8 mt-6">
                <!-- Vertical Line -->
                <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-white/30 md:left-1/2 md:-ml-0.5"></div>

                ${state.articles.map((item, i) => `
                    <div class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group animate-fade-in stagger-1">
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
                                <a href="${item.sources[0]?.link}" target="_blank" class="hover:text-indigo-600 transition">
                                    ${item.title}
                                </a>
                            </h3>
                            <p class="text-slate-600 text-sm leading-relaxed mb-4">
                                ${item.summary}
                            </p>
                            <div class="flex flex-wrap gap-2 pt-3 border-t border-slate-100/50">
                                ${item.sources.map(s => `
                                    <a href="${s.link}" target="_blank" class="text-xs flex items-center space-x-1 px-2 py-1 rounded bg-slate-50 border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600 transition text-slate-500">
                                        <span>${s.source}</span>
                                        <span class="opacity-50">↗</span>
                                    </a>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                `).join('')}
                
                ${state.articles.length === 0 ? `
                    <div class="text-center text-white/60 py-12">No updates found yet.</div>
                ` : ''}
            </div>
        </div>
    `;
}

// Search Logic (Hybrid)
let searchTimeout;

function handleSearch(query) {
    clearTimeout(searchTimeout);
    const resultsContainer = document.getElementById('searchResults');

    if (!query.trim()) {
        resultsContainer.classList.add('hidden');
        return;
    }

    // Debounce for Simple Search (Instant)
    searchTimeout = setTimeout(async () => {
        await performSearch(query, 'simple');
    }, 300);
}

async function performSearch(query, mode) {
    const resultsContainer = document.getElementById('searchResults');
    const results = await search(query, mode);

    if (results.length > 0) {
        resultsContainer.innerHTML = results.map(item => `
            <a href="#topic/${item.page_id}" onclick="document.getElementById('searchResults').classList.add('hidden'); document.getElementById('searchInput').value=''" class="block p-4 hover:bg-slate-50 border-b border-slate-100 last:border-none transition">
                <div class="text-sm font-bold text-slate-800 truncate">${item.title}</div>
                <div class="text-xs text-slate-500 mt-1 truncate">${item.summary}</div>
                <div class="text-[10px] ${mode === 'semantic' ? 'text-purple-500 bg-purple-50' : 'text-slate-500 bg-slate-100'} mt-1 font-medium inline-block px-1.5 rounded">
                    ${mode === 'semantic' ? '✨ Smart Match' : '🔍 Text Match'}
                </div>
            </a>
        `).join('');
        resultsContainer.classList.remove('hidden');
    } else {
        if (mode === 'semantic') {
            resultsContainer.innerHTML = `<div class="p-4 text-sm text-slate-500 text-center">No smart matches found.</div>`;
        } else {
            // For simple search, if no results, maybe suggest pressing enter?
            resultsContainer.innerHTML = `
                <div class="p-4 text-sm text-slate-500 text-center">
                    No exact matches.<br>
                    <span class="text-xs text-indigo-500">Press Enter for Smart Search ✨</span>
                </div>`;
        }
        resultsContainer.classList.remove('hidden');
    }
}

// Updated search fetcher
async function search(query, mode = 'semantic') {
    try {
        const res = await fetch(`${API_BASE}/search?q=${query}&mode=${mode}`);
        return await res.json();
    } catch (e) {
        console.error("Search failed", e);
        return [];
    }
}


// Helpers
function formatTitle(id) {
    if (!id) return 'Unknown';
    return id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function getEmoji(id) {
    if (id.includes('pollution')) return '🌫️';
    if (id.includes('wangchuk')) return '🏔️';
    if (id.includes('metro')) return '🚇';
    if (id.includes('formula')) return '🏎️';
    if (id.includes('tree')) return '🌳';
    if (id.includes('protest') || id.includes('incident')) return '📢';
    return '📰';
}

function getPriorityClass(priority) {
    switch (priority) {
        case 'High': return 'bg-red-100 text-red-700';
        case 'Medium': return 'bg-blue-100 text-blue-700';
        case 'Low': return 'bg-slate-100 text-slate-700';
        default: return 'bg-slate-100 text-slate-700';
    }
}
