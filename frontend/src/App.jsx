import { useState, useEffect, useCallback } from "react";
import TeamSelect from "./components/TeamSelect";
import DraftBoard from "./components/DraftBoard";
import DraftComplete from "./components/DraftComplete";
import "./App.css";

const API = "http://localhost:8000";

export default function App() {
  const [phase, setPhase] = useState("select");
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [userTeamId, setUserTeamId] = useState(null);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [picks, setPicks] = useState([]);
  const [rosters, setRosters] = useState({});
  const [currentPickIndex, setCurrentPickIndex] = useState(0);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [lastPick, setLastPick] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/players`).then((r) => r.json()),
      fetch(`${API}/api/teams`).then((r) => r.json()),
    ]).then(([p, t]) => {
      setPlayers(p);
      setTeams(t);
    });
  }, []);

  const getPickInfo = (index, teamsList) => ({
    round: Math.floor(index / 7) + 1,
    pickNum: (index % 7) + 1,
    teamId: teamsList[index % 7]?.id,
  });

  const startDraft = (teamId) => {
    setUserTeamId(teamId);
    setAvailablePlayers([...players]);
    const initRosters = {};
    teams.forEach((t) => (initRosters[t.id] = []));
    setRosters(initRosters);
    setPicks([]);
    setCurrentPickIndex(0);
    setLastPick(null);
    setPhase("draft");
  };

  const registerPick = useCallback(
    (playerId, reason, pickIndex, currentAvailable, currentRosters, currentTeams) => {
      const player = currentAvailable.find((p) => p.id === playerId);
      if (!player) return;

      const pickInfo = getPickInfo(pickIndex, currentTeams);
      const newPick = {
        round: pickInfo.round,
        pickNum: pickInfo.pickNum,
        teamId: pickInfo.teamId,
        player,
        reason,
      };

      setLastPick(newPick);
      setPicks((prev) => [...prev, newPick]);
      setAvailablePlayers((prev) => prev.filter((p) => p.id !== playerId));
      setRosters((prev) => ({
        ...prev,
        [pickInfo.teamId]: [...(prev[pickInfo.teamId] || []), player],
      }));
      setCurrentPickIndex((prev) => prev + 1);
    },
    []
  );

  // AI pick effect
  useEffect(() => {
    if (phase !== "draft" || isAiThinking || currentPickIndex >= 28) return;
    if (teams.length === 0 || availablePlayers.length === 0) return;

    const pickInfo = getPickInfo(currentPickIndex, teams);
    const isUser = pickInfo.teamId === userTeamId;
    if (isUser) return;

    const currentTeam = teams.find((t) => t.id === pickInfo.teamId);
    if (!currentTeam) return;

    const doAiPick = async () => {
      setIsAiThinking(true);
      try {
        const teamRoster = rosters[currentTeam.id] || [];
        const res = await fetch(`${API}/api/ai-pick`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            team_id: currentTeam.id,
            team_name: currentTeam.name,
            team_needs: currentTeam.needs,
            available_players: availablePlayers,
            round: pickInfo.round,
            already_drafted: teamRoster,
          }),
        });
        const data = await res.json();
        await new Promise((r) => setTimeout(r, 1000));
        registerPick(data.player_id, data.reason, currentPickIndex, availablePlayers, rosters, teams);
      } catch (err) {
        await new Promise((r) => setTimeout(r, 600));
        registerPick(availablePlayers[0].id, "Best available player.", currentPickIndex, availablePlayers, rosters, teams);
      } finally {
        setIsAiThinking(false);
      }
    };

    doAiPick();
  }, [currentPickIndex, phase, teams, userTeamId]);

  useEffect(() => {
    if (phase === "draft" && currentPickIndex >= 28) {
      setTimeout(() => setPhase("complete"), 1200);
    }
  }, [currentPickIndex, phase]);

  const currentPickInfo = teams.length > 0 ? getPickInfo(currentPickIndex, teams) : null;
  const currentTeam = currentPickInfo ? teams.find((t) => t.id === currentPickInfo?.teamId) : null;
  const isUserTurn = currentPickInfo?.teamId === userTeamId;

  const handleRestart = () => {
    setPhase("select");
    setCurrentPickIndex(0);
    setPicks([]);
    setRosters({});
    setAvailablePlayers([]);
    setLastPick(null);
    setUserTeamId(null);
    setIsAiThinking(false);
  };

  if (phase === "select") return <TeamSelect teams={teams} onSelect={startDraft} />;
  if (phase === "complete") return <DraftComplete teams={teams} rosters={rosters} picks={picks} userTeamId={userTeamId} availablePlayers={availablePlayers} onRestart={handleRestart} />;

  return (
    <DraftBoard
      teams={teams}
      availablePlayers={availablePlayers}
      picks={picks}
      rosters={rosters}
      currentTeam={currentTeam}
      currentPick={currentPickInfo}
      isUserTurn={isUserTurn && !isAiThinking && currentPickIndex < 28}
      isAiThinking={isAiThinking}
      lastPick={lastPick}
      userTeamId={userTeamId}
      onUserPick={(playerId) =>
        registerPick(playerId, "Your pick!", currentPickIndex, availablePlayers, rosters, teams)
      }
    />
  );
}
