from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="NFL Draft Simulator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load data
with open("players.json") as f:
    PLAYERS = json.load(f)

with open("teams.json") as f:
    TEAMS = json.load(f)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


# ---------- Models ----------

class Player(BaseModel):
    id: int
    name: str
    position: str
    college: str
    rank: int

class AiPickRequest(BaseModel):
    team_id: int
    team_name: str
    team_needs: List[str]
    available_players: List[Player]
    round: int
    already_drafted: List[Player]


# ---------- Routes ----------

@app.get("/api/players")
def get_players():
    return PLAYERS

@app.get("/api/teams")
def get_teams():
    return TEAMS

@app.post("/api/ai-pick")
def ai_pick(request: AiPickRequest):
    if not request.available_players:
        raise HTTPException(status_code=400, detail="No available players")

    # Build a clean list for the prompt
    players_list = "\n".join([
        f"ID {p.id}: {p.name} | {p.position} | {p.college} | Big Board Rank #{p.rank}"
        for p in request.available_players
    ])

    already_drafted_list = "\n".join([
        f"- {p.name} ({p.position})"
        for p in request.already_drafted
    ]) if request.already_drafted else "None yet"

    needs_str = ", ".join(request.team_needs)

    prompt = f"""You are the General Manager of the {request.team_name} in the NFL Draft.

CURRENT ROUND: {request.round} of 4

YOUR TEAM NEEDS (in priority order): {needs_str}

PLAYERS YOU HAVE ALREADY DRAFTED:
{already_drafted_list}

AVAILABLE PLAYERS ON THE BOARD:
{players_list}

YOUR TASK:
Select the best player for your team. Consider:
1. If a top-ranked player who fills a team need is available, prioritize them
2. If no player fills a need, take the highest-ranked player available (best player available)
3. Don't draft the same position twice unless it's your top need

Respond with ONLY a JSON object in this exact format, nothing else:
{{"player_id": <id>, "reason": "<one sentence explanation>"}}"""

    try:
        message = client.chat.completions.create(
            model="llama3-8b-8192",
            max_tokens=200,
            messages=[{"role": "user", "content": prompt}]
        )

        response_text = message.choices[0].message.content.strip()

        # Parse JSON response
        import re
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if not json_match:
            raise ValueError("No JSON found in response")

        pick_data = json.loads(json_match.group())
        player_id = pick_data["player_id"]
        reason = pick_data.get("reason", "Best available player.")

        # Validate player_id is actually available
        valid_ids = [p.id for p in request.available_players]
        if player_id not in valid_ids:
            # Fallback: pick highest ranked available player that fills a need
            for p in request.available_players:
                if p.position in request.team_needs:
                    player_id = p.id
                    reason = f"Best available player at a position of need ({p.position})."
                    break
            else:
                player_id = request.available_players[0].id
                reason = "Best available player on the board."

        return {"player_id": player_id, "reason": reason}

    except Exception as e:
        # Fallback: pick best available player that fills a need
        for p in request.available_players:
            if p.position in request.team_needs:
                return {
                    "player_id": p.id,
                    "reason": f"Selected based on team need at {p.position}."
                }
        return {
            "player_id": request.available_players[0].id,
            "reason": "Best available player on the board."
        }


@app.get("/")
def root():
    return {"message": "NFL Draft Simulator API is running!"}
