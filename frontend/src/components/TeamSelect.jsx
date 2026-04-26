import { useState } from "react";
import "./TeamSelect.css";

const NEED_COLORS = {
  QB: "#ff4757", WR: "#4a9eff", OT: "#2ed573", OG: "#2ed573",
  EDGE: "#a855f7", DT: "#ff7f50", CB: "#00cec9", S: "#ffd700",
  LB: "#9b59b6", TE: "#e84393", RB: "#6ab04c",
};

export default function TeamSelect({ teams, onSelect }) {
  const [hovered, setHovered] = useState(null);

  if (!teams.length) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading Draft Data...</p>
      </div>
    );
  }

  return (
    <div className="team-select-page">
      <div className="select-header">
        <div className="select-title-wrap">
          <span className="select-eyebrow">2026 NFL DRAFT SIMULATOR</span>
          <h1 className="select-title">CHOOSE YOUR FRANCHISE</h1>
          <p className="select-sub">You control the front office. 4 rounds. 30 prospects. Build your roster.</p>
        </div>
        <div className="draft-meta">
          <div className="meta-item">
            <span className="meta-val">7</span>
            <span className="meta-label">Teams</span>
          </div>
          <div className="meta-divider" />
          <div className="meta-item">
            <span className="meta-val">4</span>
            <span className="meta-label">Rounds</span>
          </div>
          <div className="meta-divider" />
          <div className="meta-item">
            <span className="meta-val">30</span>
            <span className="meta-label">Prospects</span>
          </div>
        </div>
      </div>

      <div className="teams-grid">
        {teams.map((team, i) => (
          <div
            key={team.id}
            className={`team-card ${hovered === team.id ? "hovered" : ""}`}
            style={{ "--team-color": team.primaryColor, animationDelay: `${i * 0.07}s` }}
            onMouseEnter={() => setHovered(team.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelect(team.id)}
          >
            <div className="team-card-glow" />
            <div className="team-pick-badge">PICK #{team.pickOrder}</div>
            <div className="team-card-body">
              <h2 className="team-name">{team.name}</h2>
              <p className="team-context">{team.context}</p>
              <div className="team-needs-row">
                <span className="needs-label">NEEDS</span>
                <div className="needs-chips">
                  {team.needs.map((need) => (
                    <span
                      key={need}
                      className="need-chip"
                      style={{ color: NEED_COLORS[need] || "#fff", borderColor: NEED_COLORS[need] || "#fff" }}
                    >
                      {need}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="team-card-footer">
              <span>SELECT FRANCHISE →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
