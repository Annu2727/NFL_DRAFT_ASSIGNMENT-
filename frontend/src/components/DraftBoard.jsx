import { useState } from "react";
import "./DraftBoard.css";

const POS_NEEDS = {
  QB: "#ff4757", WR: "#4a9eff", OT: "#2ed573", OG: "#2ed573",
  EDGE: "#a855f7", DT: "#ff7f50", CB: "#00cec9", S: "#ffd700",
  LB: "#9b59b6", TE: "#e84393", RB: "#6ab04c",
};

function PosBadge({ pos }) {
  return <span className={`pos-badge pos-${pos}`}>{pos}</span>;
}

function NeedMatch({ position, needs }) {
  return needs.includes(position)
    ? <span className="need-match">✦ NEED</span>
    : null;
}

export default function DraftBoard({
  teams, availablePlayers, picks, rosters,
  currentTeam, currentPick, isUserTurn, isAiThinking,
  lastPick, userTeamId, onUserPick,
}) {
  const [activeTab, setActiveTab] = useState("board");
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const userTeam = teams.find((t) => t.id === userTeamId);
  const userRoster = rosters[userTeamId] || [];

  const handlePickClick = (player) => {
    if (!isUserTurn) return;
    if (selectedPlayer?.id === player.id) {
      onUserPick(player.id);
      setSelectedPlayer(null);
    } else {
      setSelectedPlayer(player);
    }
  };

  const roundPicks = [1,2,3,4].map((r) => picks.filter((p) => p.round === r));

  return (
    <div className="draft-board-page">
      {/* TOP BAR */}
      <div className="top-bar">
        <div className="top-bar-left">
          <span className="top-logo">NFL DRAFT</span>
          <span className="top-year">2026</span>
        </div>
        <div className="top-center">
          <div className={`pick-indicator ${isUserTurn ? "user-turn" : ""} ${isAiThinking ? "ai-thinking" : ""}`}>
            {isAiThinking ? (
              <><span className="dot-pulse" />{currentTeam?.name} is on the clock...</>
            ) : isUserTurn ? (
              <><span className="blink-dot" />YOU ARE ON THE CLOCK</>
            ) : (
              <>{currentTeam?.name} — Round {currentPick?.round}, Pick {currentPick?.pickNum}</>
            )}
          </div>
        </div>
        <div className="top-bar-right">
          <span className="round-counter">RD {currentPick?.round} / 4</span>
          <span className="pick-counter">PICK {((currentPick?.round - 1) * 7 + currentPick?.pickNum)} / 28</span>
        </div>
      </div>

      <div className="board-layout">
        {/* LEFT: Player Board + Pick Log Tabs */}
        <div className="left-panel">
          <div className="tab-bar">
            <button className={activeTab === "board" ? "tab active" : "tab"} onClick={() => setActiveTab("board")}>
              BIG BOARD <span className="tab-count">{availablePlayers.length}</span>
            </button>
            <button className={activeTab === "log" ? "tab active" : "tab"} onClick={() => setActiveTab("log")}>
              PICK LOG <span className="tab-count">{picks.length}</span>
            </button>
          </div>

          {activeTab === "board" && (
            <div className="player-list">
              {availablePlayers.length === 0 && (
                <div className="empty-board">All players have been drafted!</div>
              )}
              {availablePlayers.map((player) => {
                const isNeeded = userTeam?.needs.includes(player.position);
                const isSelected = selectedPlayer?.id === player.id;
                return (
                  <div
                    key={player.id}
                    className={`player-row ${isNeeded ? "needed" : ""} ${isSelected ? "selected" : ""} ${isUserTurn ? "clickable" : ""}`}
                    onClick={() => handlePickClick(player)}
                  >
                    <span className="player-rank">#{player.rank}</span>
                    <div className="player-info">
                      <span className="player-name">{player.name}</span>
                      <span className="player-college">{player.college}</span>
                    </div>
                    <div className="player-right">
                      <PosBadge pos={player.position} />
                      {isNeeded && <NeedMatch position={player.position} needs={userTeam?.needs || []} />}
                    </div>
                    {isSelected && isUserTurn && (
                      <div className="pick-confirm-hint">Click again to draft</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "log" && (
            <div className="pick-log">
              {picks.length === 0 && <div className="empty-board">No picks yet.</div>}
              {[...picks].reverse().map((pick, i) => {
                const team = teams.find((t) => t.id === pick.teamId);
                const isUser = pick.teamId === userTeamId;
                return (
                  <div key={i} className={`log-row ${isUser ? "user-pick-log" : ""}`}>
                    <div className="log-meta">
                      <span className="log-round">R{pick.round} P{pick.pickNum}</span>
                      <span className="log-team">{team?.shortName}</span>
                    </div>
                    <div className="log-player">
                      <span className="log-name">{pick.player.name}</span>
                      <PosBadge pos={pick.player.position} />
                    </div>
                    {pick.reason && pick.reason !== "Your pick!" && (
                      <div className="log-reason">"{pick.reason}"</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CENTER: Draft Order / Rounds */}
        <div className="center-panel">
          <div className="rounds-header">DRAFT ORDER</div>
          {[1,2,3,4].map((round) => (
            <div key={round} className="round-section">
              <div className="round-label">ROUND {round}</div>
              <div className="round-picks">
                {teams.map((team) => {
                  const pick = picks.find((p) => p.round === round && p.teamId === team.id);
                  const isCurrentSlot = currentPick?.round === round && currentPick?.teamId === team.id;
                  const isUser = team.id === userTeamId;
                  return (
                    <div
                      key={team.id}
                      className={`round-slot ${pick ? "filled" : ""} ${isCurrentSlot && !pick ? "current" : ""} ${isUser ? "user-slot" : ""}`}
                    >
                      <span className="slot-team">{team.shortName}</span>
                      {pick ? (
                        <div className="slot-pick">
                          <span className="slot-player">{pick.player.name}</span>
                          <PosBadge pos={pick.player.position} />
                        </div>
                      ) : isCurrentSlot ? (
                        <span className="slot-clock">{isAiThinking ? "Picking..." : isUser ? "YOUR PICK" : "On Clock"}</span>
                      ) : (
                        <span className="slot-empty">—</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT: Your Team Panel */}
        <div className="right-panel">
          <div className="your-team-header">
            <span className="your-team-label">YOUR FRANCHISE</span>
            <span className="your-team-name">{userTeam?.name}</span>
          </div>

          <div className="team-needs-section">
            <div className="section-label">TEAM NEEDS</div>
            <div className="needs-list">
              {userTeam?.needs.map((need) => {
                const filled = userRoster.some((p) => p.position === need);
                return (
                  <div key={need} className={`need-row ${filled ? "filled" : ""}`}>
                    <span className="need-pos" style={{ color: POS_NEEDS[need] }}>{need}</span>
                    <span className="need-status">{filled ? "✓ Filled" : "Needed"}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="team-roster-section">
            <div className="section-label">YOUR ROSTER ({userRoster.length}/4)</div>
            {userRoster.length === 0 && (
              <div className="empty-roster">No picks yet. Make your first selection!</div>
            )}
            {userRoster.map((player, i) => (
              <div key={i} className="roster-row">
                <span className="roster-round">R{picks.find((p) => p.teamId === userTeamId && p.player.id === player.id)?.round}</span>
                <div className="roster-info">
                  <span className="roster-name">{player.name}</span>
                  <span className="roster-college">{player.college}</span>
                </div>
                <PosBadge pos={player.position} />
              </div>
            ))}
          </div>

          {/* Last Pick Banner */}
          {lastPick && (
            <div className={`last-pick-banner ${lastPick.teamId === userTeamId ? "user-banner" : ""}`}>
              <div className="banner-label">LAST PICK</div>
              <div className="banner-team">{teams.find((t) => t.id === lastPick.teamId)?.shortName}</div>
              <div className="banner-player">{lastPick.player.name}</div>
              <PosBadge pos={lastPick.player.position} />
            </div>
          )}

          {isUserTurn && !isAiThinking && (
            <div className="your-turn-banner">
              <div className="pulse-ring" />
              <span>YOU'RE ON THE CLOCK!</span>
              <p>Click a player once to preview, twice to draft</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
