const API_BASE = '/api';
const GITHUB_URL = 'https://github.com/TanishkBansode/wangchuk-tracker';

// Topics config (display names + IDs)
const TOPICS = [
    { id: 'wangchuk', label: '🏔️ Sonam Wangchuk' },
    { id: 'iran_israel_war', label: '⚔️ Iran-Israel-America War' },
    { id: 'lpg_shortage_india', label: '🔥 LPG Shortage India' },
];

// State
const state = {
    activeTopic: 'wangchuk',
    articles: []
};

// Initialize
window.addEventListener('load', init);

async function init() {
    await fetchArticles(state.activeTopic);
    render();
}

// API Call
async function fetchArticles(topicId) {
    try {
        const res = await fetch(`${API_BASE}/articles?topic=${topicId}`);
        state.articles = await res.json();
    } catch (e) {
        console.error("Failed to fetch articles", e);
        state.articles = [];
    }
}

// Switch topic
async function switchTopic(topicId) {
    state.activeTopic = topicId;
    state.articles = [];
    renderSkeleton();
    await fetchArticles(topicId);
    renderTimeline();
}

// Rendering
const main = document.getElementById('app');

function renderSkeleton() {
    document.getElementById('timeline').innerHTML = `
        ${Array(3).fill(0).map(() => `
            <div class="glass-card h-32 rounded-xl animate-pulse mb-4"></div>
        `).join('')}
    `;
}

function renderTimeline() {
    document.getElementById('timeline').innerHTML = `
        ${state.articles.map((item, i) => `
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
    `;
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

            <!-- Article count -->
            <div class="text-center text-white/60 text-sm mb-8">
                ${state.articles.length} updates on <span class="font-semibold text-white/80">${activeTopic?.label}</span>
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

// Helpers
function getPriorityClass(priority) {
    switch (priority) {
        case 'High': return 'bg-red-100 text-red-700';
        case 'Medium': return 'bg-blue-100 text-blue-700';
        case 'Low': return 'bg-slate-100 text-slate-700';
        default: return 'bg-slate-100 text-slate-700';
    }
}
