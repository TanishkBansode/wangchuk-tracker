# 🏔️ Sonam Wangchuk News Tracker

An AI-powered news aggregator that tracks and summarizes news about **Sonam Wangchuk** — engineer, innovator, and education reformist from Ladakh.

## Features

- 🔍 **Smart News Aggregation** - Automatically fetches news from Google News RSS
- 🤖 **AI-Powered Analysis** - Uses Gemini AI to filter relevant articles and generate summaries
- 🔄 **Deduplication** - Intelligently merges duplicate stories from multiple sources
- 🔎 **Semantic Search** - Search articles using natural language queries
- ⏰ **Scheduled Updates** - GitHub Actions runs hourly to fetch new articles

## Tech Stack

- **Backend**: Python (FastAPI)
- **Database**: Turso (libsql)
- **AI**: Google Gemini API
- **Frontend**: Vanilla JS + TailwindCSS
- **Deployment**: Render / Cloudflare Workers

## Setup

### 1. Clone the Repository
```bash
git clone https://github.com/TanishkBansode/wangchuk-tracker.git
cd wangchuk-tracker
```

### 2. Install Dependencies
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure Environment
Copy the example env file and fill in your credentials:
```bash
cp .env.example .env
```

Required environment variables:
- `GEMINI_API_KEY` - Get from [Google AI Studio](https://aistudio.google.com/)
- `TURSO_DB_URL` - Your Turso database URL
- `TURSO_DB_TOKEN` - Your Turso authentication token

### 4. Run the Server
```bash
python server.py
```
Visit `http://localhost:8000` to view the tracker.

### 5. Fetch News (Manual)
```bash
python main.py
```

## GitHub Actions

The repository includes a GitHub Action that runs the news fetcher every hour. To enable it:

1. Go to your repository Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `GEMINI_API_KEY`
   - `TURSO_DB_URL`
   - `TURSO_DB_TOKEN`

## License

MIT
