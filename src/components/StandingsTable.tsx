import type { Standings, PlayerStats } from '../types';
import { getRatingColor } from '../utils/eloRating';

interface StandingsTableProps {
  standings: Standings;
}

const getMedalEmoji = (position: number): string => {
  switch (position) {
    case 1: return '🥇';
    case 2: return '🥈';
    case 3: return '🥉';
    default: return '';
  }
};

const Podium: React.FC<{ topThree: PlayerStats[] }> = ({ topThree }) => {
  // Ordina per il podio: 2°, 1°, 3° (visivamente)
  const [second, first, third] = [topThree[1], topThree[0], topThree[2]].filter(Boolean);

  return (
    <div className="podium">
      {second && (
        <div className="podium-place podium-second">
          <div className="podium-medal">🥈</div>
          {second.playerAvatar ? (
            <img src={second.playerAvatar} alt={second.playerName} className="podium-avatar" />
          ) : (
            <div className="podium-avatar-fallback">🎾</div>
          )}
          <div className="podium-name">{second.playerName}</div>
          <div className="podium-points">{second.points} pt</div>
          <div className="podium-base podium-base-2">2°</div>
        </div>
      )}
      {first && (
        <div className="podium-place podium-first">
          <div className="podium-medal">🥇</div>
          {first.playerAvatar ? (
            <img src={first.playerAvatar} alt={first.playerName} className="podium-avatar" />
          ) : (
            <div className="podium-avatar-fallback">🎾</div>
          )}
          <div className="podium-name">{first.playerName}</div>
          <div className="podium-points">{first.points} pt</div>
          <div className="podium-base podium-base-1">1°</div>
        </div>
      )}
      {third && (
        <div className="podium-place podium-third">
          <div className="podium-medal">🥉</div>
          {third.playerAvatar ? (
            <img src={third.playerAvatar} alt={third.playerName} className="podium-avatar" />
          ) : (
            <div className="podium-avatar-fallback">🎾</div>
          )}
          <div className="podium-name">{third.playerName}</div>
          <div className="podium-points">{third.points} pt</div>
          <div className="podium-base podium-base-3">3°</div>
        </div>
      )}
    </div>
  );
};

export const StandingsTable: React.FC<StandingsTableProps> = ({ standings }) => {
  const topThree = standings.stats.slice(0, 3);
  const hasTopThree = topThree.length >= 3;

  return (
    <div className="standings-container">
      {hasTopThree && <Podium topThree={topThree} />}

      <div className="standings-table">
        <table>
          <thead>
            <tr>
              <th>Pos</th>
              <th>Nome</th>
              <th>Rating</th>
              <th>P</th>
              <th>W</th>
              <th>L</th>
              <th>GV</th>
              <th>GP</th>
              <th>ΔG</th>
            </tr>
          </thead>
          <tbody>
            {standings.stats.map((stat, index) => (
              <tr key={stat.playerId} className={index < 3 ? `position-${index + 1}` : ''}>
                <td className="position">
                  {index < 3 ? getMedalEmoji(index + 1) : index + 1}
                </td>
                <td className="player-name">{stat.playerName}</td>
                <td className="rating" style={{ color: getRatingColor(stat.rating), fontWeight: 'bold' }}>
                  {stat.rating}
                </td>
                <td>{stat.played}</td>
                <td>{stat.wins}</td>
                <td>{stat.losses}</td>
                <td className="games-won">{stat.gamesWon}</td>
                <td>{stat.gamesLost}</td>
                <td className={stat.gameDiff >= 0 ? 'positive' : 'negative'}>
                  {stat.gameDiff >= 0 ? '+' : ''}
                  {stat.gameDiff}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
