# NFL Mock Draft Simulator 2026

A full-stack NFL Draft Simulator where you control one of 7 real teams and AI controls the rest. Built with React + FastAPI + Groq LLM.

## Loom Walkthrough
> [Add your Loom link here]

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Backend | Python + FastAPI |
| AI | Anthropic Claude (claude-sonnet-4-20250514) |
| Data | JSON (players.json, teams.json) |

---

## Project Structure

```
nfl-draft-simulator/
├── backend/
│   ├── main.py           # FastAPI app with 3 endpoints
│   ├── players.json      # 30 draft prospects (Big Board)
│   ├── teams.json        # 7 teams with needs + context
│   ├── requirements.txt  # Python dependencies
│   └── .env.example      # Copy to .env and add API key
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # Root component + draft state
│   │   ├── App.css               # Global styles + design tokens
│   │   └── components/
│   │       ├── TeamSelect.jsx    # Team selection screen
│   │       ├── DraftBoard.jsx    # Main draft UI
│   │       └── DraftComplete.jsx # Results screen
│   └── package.json
└── README.md
```

---

## Setup Instructions

### 1. Clone the repo
```bash
git clone <your-repo-url>
cd nfl-draft-simulator
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate      # Mac/Linux
# OR
venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Add your API key
cp .env.example .env
# Open .env and add your Anthropic API key:
# ANTHROPIC_API_KEY=your_key_here
```

Get your Anthropic API key at: https://console.anthropic.com

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

### 4. Run the App

**Terminal 1 — Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Open http://localhost:5173 in your browser.

---

## How It Works

### Draft Mechanics
- 4 rounds × 7 teams = 28 total picks
- Pick order: Teams 1–7 every round (same order each round)
- 30 prospects available; 2 go undrafted at the end

### AI Decision Logic
Each AI team calls `POST /api/ai-pick` with:
- Team name + needs
- Available players on the board
- Players already drafted by that team
- Current round

Claude returns a player ID + one-sentence explanation. Fallback logic ensures the app never breaks if the LLM call fails.

### State Management
All draft state lives in `App.jsx`:
- `availablePlayers` — shrinks with each pick
- `rosters` — each team's selected players
- `picks` — full pick log with round/team/player/reason
- `currentPickIndex` — 0–27, drives the entire draft loop

---

## Architecture Decisions

**Why FastAPI?**
Simple, fast, auto-docs at `/docs`. The backend only needs 3 endpoints — FastAPI is perfect for this scope.

**Why state in frontend?**
The backend is stateless by design. The frontend sends everything the AI needs on each request (available players, team needs, current roster). This makes the backend simple and easy to test.

**Why no database?**
Player and team data is static — it never changes during a session. JSON files loaded at startup are simpler, faster, and sufficient.

**AI Fallback Strategy**
If an LLM call fails, the backend falls back to: pick highest-ranked player at a position of need → pick highest-ranked player overall. The draft never breaks.

---

## What I'd Improve With More Time

- [ ] Trade system between picks
- [ ] Player grades and letter grades for each team's draft class
- [ ] Persistent draft history / share results link
- [ ] Sound effects for picks
- [ ] Mobile responsive layout
- [ ] Streaming AI responses for a more live feel
- [ ] More teams (full 32-team NFL draft)
- [ ] All 7 rounds
