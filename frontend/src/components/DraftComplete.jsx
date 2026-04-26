import "./DraftComplete.css";

function PosBadge({ pos }) {
  return <span className={`pos-badge pos-${pos}`}>{pos}</span>;
}

export default function DraftComplete({ teams, rosters, picks, userTeamId, availablePlayers, onRestart }) {
  const userTeam = teams.find((t) => t.id === userTeamId);
  const userRoster = rosters[userTeamId] || [];

  return (
    <div className="complete-page">
      <div className="complete-header">
        <span className="complete-eyebrow">2026 NFL DRAFT — COMPLETE</span>
        <h1 className="complete-title">DRAFT RESULTS</h1>
        <p className="complete-sub">28 picks made · {availablePlayers.length} prospects undrafted</p>
      </div>

      {/* User Team Highlight */}
      <div className="user-result-card">
        <div className="user-result-label">YOUR DRAFT CLASS</div>
        <div className="user-result-team">{userTeam?.name}</div>
        <div className="user-result-picks">
          {userRoster.map((player, i) => {
            const pick = picks.find((p) => p.teamId === userTeamId && p.player.id === player.id);
            return (
              <div key={i} className="user-pick-row">
                <span className="upr-round">Round {pick?.round}</span>
                <span className="upr-name">{player.name}</span>
                <PosBadge pos={player.position} />
                <span className="upr-college">{player.college}</span>
                <span className="upr-rank">#{player.rank} overall</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* All Teams */}
      <div className="all-teams-grid">
        {teams.filter((t) => t.id !== userTeamId).map((team) => {
          const roster = rosters[team.id] || [];
          return (
            <div key={team.id} className="team-result-card">
              <div className="trc-header">
                <span className="trc-name">{team.name}</span>
                <span className="trc-pick">Pick #{team.pickOrder}</span>
              </div>
              <div className="trc-picks">
                {roster.map((player, i) => {
                  const pick = picks.find((p) => p.teamId === team.id && p.player.id === player.id);
                  return (
                    <div key={i} className="trc-row">
                      <span className="trc-round">R{pick?.round}</span>
                      <span className="trc-player">{player.name}</span>
                      <PosBadge pos={player.position} />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Undrafted */}
      {availablePlayers.length > 0 && (
        <div className="undrafted-section">
          <div className="undrafted-label">UNDRAFTED PROSPECTS</div>
          <div className="undrafted-list">
            {availablePlayers.map((p) => (
              <div key={p.id} className="undrafted-row">
                <span className="ud-rank">#{p.rank}</span>
                <span className="ud-name">{p.name}</span>
                <PosBadge pos={p.position} />
                <span className="ud-college">{p.college}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button className="restart-btn" onClick={onRestart}>
        RUN ANOTHER DRAFT
      </button>
    </div>
  );
}
