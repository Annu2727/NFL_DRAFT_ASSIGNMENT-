# 🏈 NFL Mock Draft Simulator 2026

A full-stack NFL Draft Simulator where you control one of 7 real NFL teams and AI controls the remaining 6. Built with React + FastAPI + Groq AI (LLaMA3).

## 🎥 Loom Walkthrough
> https://www.loom.com/share/8244531c681843a8a31073b55ab62a02

---

## 🎮 How to Play

1. Open the app at **http://localhost:5173**
2. **Choose your team** from the 7 real 2026 NFL Draft teams
3. The draft begins — 4 rounds, 7 teams, 28 total picks
4. **When it's your turn** — you'll see "YOU ARE ON THE CLOCK"
   - Click a player **once** to preview
   - Click the **same player again** to draft them
5. **When it's an AI turn** — AI automatically picks within 1-2 seconds
6. After all 4 rounds — see the complete draft results for every team

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React + Vite | Component-based UI, fast dev server |
| Backend | Python + FastAPI | Simple, fast, 3 endpoints only |
| AI | Groq API (LLaMA3-8b) | Free, fast inference for AI picks |
| Data | JSON files | Static data, no database needed |

---

## 📁 Project Structure

```
nfl-draft-simulator/
├── backend/
│   ├── main.py              # FastAPI server — 3 endpoints
│   ├── players.json         # 30 draft prospects (Big Board)
│   ├── teams.json           # 7 teams with needs and context
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # API key template
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Root component + all draft state
│   │   ├── App.css          # Global styles and design tokens
│   │   └── components/
│   │       ├── TeamSelect.jsx      # Team selection screen
│   │       ├── TeamSelect.css
│   │       ├── DraftBoard.jsx      # Main 3-panel draft UI
│   │       ├── DraftBoard.css
│   │       ├── DraftComplete.jsx   # Final results screen
│   │       └── DraftComplete.css
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js v20+ — download at https://nodejs.org
- Free Groq API key — get it at https://console.groq.com

---

### 1. Clone the Repository
```bash
git clone https://github.com/Annu2727/NFL_DRAFT_ASSIGNMENT-.git
cd NFL_DRAFT_ASSIGNMENT-
```

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it (Windows)
venv\Scripts\activate

# Activate it (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Add your Groq API key in `main.py` line 29:
```python
client = Groq(api_key="gsk_your_key_here")
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

---

### 4. Run the App

Open **two terminals** at the same time:

**Terminal 1 — Start Backend:**
```bash
cd backend
venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

You should see:
```
INFO: Application startup complete.
Uvicorn running on http://127.0.0.1:8000
```

**Terminal 2 — Start Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
Local: http://localhost:5173/
```

Now open **http://localhost:5173** in your browser.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/players` | Returns all 30 draft prospects |
| GET | `/api/teams` | Returns all 7 teams with needs |
| POST | `/api/ai-pick` | AI picks a player for a team |

Test them at **http://localhost:8000/docs**

---

## 🏟️ Teams in the Simulator

| Pick | Team | Key Needs | Context |
|------|------|-----------|---------|
| 1 | Las Vegas Raiders | QB, CB, OT | No long-term QB, secondary leaks |
| 2 | New York Jets | OT, WR, QB | Full roster reset needed |
| 3 | Arizona Cardinals | QB, OT, WR | Kyler Murray's future uncertain |
| 4 | Tennessee Titans | OT, WR, EDGE | Need weapons around Cam Ward |
| 5 | New York Giants | WR, EDGE, OT | Need playmakers around Jaxon Dart |
| 6 | Cleveland Browns | EDGE, WR, CB | Fewest receiving yards in NFL 2025 |
| 7 | Washington Commanders | EDGE, CB, LB | Oldest roster in NFL |

---

## 👥 Player Pool — Top 30 Prospects (Big Board)

| Rank | Player | Position | College |
|------|--------|----------|---------|
| 1 | Travis Hunter | CB | Colorado |
| 2 | Shedeur Sanders | QB | Colorado |
| 3 | Abdul Carter | EDGE | Penn State |
| 4 | Ashton Jeanty | RB | Boise State |
| 5 | Will Campbell | OT | LSU |
| 6 | Mason Graham | DT | Michigan |
| 7 | Tetairoa McMillan | WR | Arizona |
| 8 | Malaki Starks | S | Georgia |
| 9 | Kelvin Banks Jr. | OT | Texas |
| 10 | Jalon Walker | LB | Georgia |
| 11 | Mykel Williams | EDGE | Georgia |
| 12 | Demetrius Knight Jr. | LB | South Carolina |
| 13 | Luther Burden III | WR | Missouri |
| 14 | Tyler Warren | TE | Penn State |
| 15 | Omarion Hampton | RB | UNC |
| 16 | James Pearce Jr. | EDGE | Tennessee |
| 17 | Jihaad Campbell | LB | Alabama |
| 18 | Grey Zabel | OG | NDSU |
| 19 | Derrick Harmon | DT | Oregon |
| 20 | Matthew Golden | WR | Texas |
| 21 | Donovan Ezeiruaku | EDGE | Boston College |
| 22 | Tyleik Williams | DT | Ohio State |
| 23 | Nick Emmanwori | S | South Carolina |
| 24 | Emeka Egbuka | WR | Ohio State |
| 25 | Josh Simmons | OT | Ohio State |
| 26 | Jayden Higgins | WR | Iowa State |
| 27 | Jonah Savaiinaea | OG | Arizona |
| 28 | Kaleb Johnson | RB | Iowa |
| 29 | Maxwell Hairston | CB | Kentucky |
| 30 | Jack Sawyer | EDGE | Ohio State |

---

## 🧠 AI Decision Logic

When it's an AI team's turn, the backend sends this to Groq (LLaMA3):
- Team name and positional needs
- Full list of available players with ranks
- Players the team has already drafted
- Current round number

Groq returns the best player ID + a one-sentence reason why.

**Fallback strategy** (if AI call fails):
1. Pick highest-ranked player at a position of need
2. If no match → pick highest-ranked player overall
3. Draft never breaks no matter what

---

## 🏗️ Architecture Decisions

**Why FastAPI over Node.js/Express?**
The team only knows Python. FastAPI is simple, fast, and only needs 3 endpoints for this project. It also auto-generates API docs at `/docs`.

**Why keep state in the frontend?**
The backend is completely stateless. The frontend sends everything the AI needs on each request — available players, team needs, current roster. This makes the backend easy to test and debug independently.

**Why no database?**
Player and team data never changes during a session. Loading JSON files at startup is simpler, faster, and perfectly sufficient for this scope.

**Why Groq instead of OpenAI or Anthropic?**
Groq is completely free and has very fast inference. LLaMA3-8b is more than capable of making smart draft decisions from a structured prompt.

**Why single pick order every round?**
The assignment specifies the same pick order (1-7) repeating each round. This simplifies the draft loop — `currentPickIndex % 7` always gives the correct team.

---

## 🚀 What I'd Improve With More Time

- [ ] Trade system between teams before picks
- [ ] Letter grades (A, B, C) for each team's final draft class
- [ ] Shareable results link so you can show friends your draft
- [ ] Mobile responsive layout
- [ ] Sound effects when picks are made
- [ ] All 7 rounds instead of 4
- [ ] Full 32-team NFL draft experience
- [ ] Deploy online so no local setup needed