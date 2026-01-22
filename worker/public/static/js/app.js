const API_BASE = '/api';

// State
const state = {
    articles: []
};

// Initialize
window.addEventListener('load', init);

async function init() {
    await fetchArticles();
    render();
}

// API Call - fetch Wangchuk articles directly
async function fetchArticles() {
    try {
        const res = await fetch(`${API_BASE}/articles?topic=wangchuk`);
        state.articles = await res.json();
    } catch (e) {
        console.error("Failed to fetch articles", e);
    }
}

// Render the page
const main = document.getElementById('app');

function render() {
    main.innerHTML = `
        <div class="animate-fade-in max-w-4xl mx-auto px-4 py-8">
            <!-- Header -->
            <div class="text-center mb-12">
                <h1 class="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-md">
                    🏔️ Sonam Wangchuk
                </h1>
                <p class="text-white/80 text-lg max-w-2xl mx-auto">
                    Engineer, innovator, and education reformist from Ladakh
                </p>
                <div class="mt-4 text-white/60 text-sm">
                    ${state.articles.length} news updates
                </div>
            </div>

            <!-- Timeline -->
            <div class="relative space-y-6">
                <!-- Vertical Line -->
                <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-white/30 md:left-1/2 md:-ml-0.5"></div>

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
            </div>
        </div>
    `;
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
