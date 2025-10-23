import { useState } from 'react';
import type { Player } from '../types';
import { getRatingCategory, getRatingColor } from '../utils/eloRating';

interface PlayerListProps {
  players: Player[];
  onRemovePlayer: (playerId: string) => void;
  onEditRating: (playerId: string, newRating: number) => void;
}

export const PlayerList: React.FC<PlayerListProps> = ({ players, onRemovePlayer, onEditRating }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState<number>(1000);

  // Ordina i giocatori per rating (dal più alto al più basso)
  const sortedPlayers = [...players].sort((a, b) => b.rating - a.rating);

  const handleStartEdit = (player: Player) => {
    setEditingId(player.id);
    setEditRating(player.rating);
  };

  const handleSaveEdit = (playerId: string) => {
    if (editRating < 0 || editRating > 3000) {
      alert('Il rating deve essere tra 0 e 3000');
      return;
    }
    onEditRating(playerId, editRating);
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

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
        {sortedPlayers.map((player, index) => {
          const isEditing = editingId === player.id;

          return (
            <li key={player.id} className={`player-item ${isEditing ? 'editing' : ''}`}>
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
                {isEditing ? (
                  <div className="rating-edit-controls">
                    <input
                      type="number"
                      value={editRating}
                      onChange={(e) => setEditRating(parseInt(e.target.value) || 0)}
                      className="input-rating-edit"
                      min="0"
                      max="3000"
                      autoFocus
                    />
                    <button onClick={() => handleSaveEdit(player.id)} className="btn btn-success-small">
                      ✓
                    </button>
                    <button onClick={handleCancelEdit} className="btn btn-secondary-small">
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="player-rating" style={{ color: getRatingColor(player.rating) }}>
                    <span className="rating-value">{player.rating}</span>
                    <span className="rating-category">({getRatingCategory(player.rating)})</span>
                  </div>
                )}
              </div>
              {!isEditing && (
                <div className="player-actions">
                  <button onClick={() => handleStartEdit(player)} className="btn-edit" title="Modifica rating">
                    ✎
                  </button>
                  <button onClick={() => onRemovePlayer(player.id)} className="btn-remove" title="Rimuovi giocatore">
                    ×
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {players.length === 0 && (
        <div className="empty-state">
          Nessun giocatore aggiunto. Inizia aggiungendo i giocatori sopra.
        </div>
      )}
    </div>
  );
};
