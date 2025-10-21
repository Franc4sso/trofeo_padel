import type { Player } from '../types';
import { getRatingCategory, getRatingColor } from '../utils/eloRating';

interface PlayerListProps {
  players: Player[];
  onRemovePlayer: (playerId: string) => void;
}

export const PlayerList: React.FC<PlayerListProps> = ({ players, onRemovePlayer }) => {
  // Ordina i giocatori per rating (dal più alto al più basso)
  const sortedPlayers = [...players].sort((a, b) => b.rating - a.rating);

  return (
    <div className="player-list">
      <div className="player-list-header">
        <h3>Giocatori ({players.length})</h3>
        <div className="stats-summary">
          <span>Rating medio: {Math.round(players.reduce((sum, p) => sum + p.rating, 0) / players.length) || 0}</span>
          <span>Range: {Math.min(...players.map(p => p.rating))} - {Math.max(...players.map(p => p.rating))}</span>
        </div>
      </div>
      <ul className="player-list-items">
        {sortedPlayers.map((player, index) => (
          <li key={player.id} className="player-item">
            <div className="player-rank">#{index + 1}</div>
            <div className="player-avatar">
              {player.avatar ? (
                <img src={player.avatar} alt={player.name} />
              ) : (
                <div className="avatar-fallback">🎾</div>
              )}
            </div>
            <div className="player-info">
              <div className="player-name">{player.name}</div>
              <div className="player-rating" style={{ color: getRatingColor(player.rating) }}>
                <span className="rating-value">{player.rating}</span>
                <span className="rating-category">({getRatingCategory(player.rating)})</span>
              </div>
            </div>
            <button onClick={() => onRemovePlayer(player.id)} className="btn-remove">
              ×
            </button>
          </li>
        ))}
      </ul>
      {players.length === 0 && (
        <div className="empty-state">
          Nessun giocatore aggiunto. Inizia aggiungendo i giocatori sopra.
        </div>
      )}
    </div>
  );
};
