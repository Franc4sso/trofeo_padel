import { useState } from 'react';
import type { Match } from '../types';

interface MatchCardProps {
  match: Match;
  onUpdateResult: (matchId: string, team1Score: number, team2Score: number) => void;
}

function formatRatingChange(change: number | undefined): string {
  if (change === undefined) return '';
  const sign = change >= 0 ? '+' : '';
  return `${sign}${Math.round(change)}`;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onUpdateResult }) => {
  const [team1Score, setTeam1Score] = useState(match.result?.team1Score ?? 0);
  const [team2Score, setTeam2Score] = useState(match.result?.team2Score ?? 0);
  const [isEditing, setIsEditing] = useState(!match.result);

  const handleSave = () => {
    try {
      onUpdateResult(match.id, team1Score, team2Score);
      setIsEditing(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Errore durante il salvataggio');
    }
  };

  const handleCancel = () => {
    if (match.result) {
      setTeam1Score(match.result.team1Score);
      setTeam2Score(match.result.team2Score);
      setIsEditing(false);
    }
  };

  const isValidScore = (score1: number, score2: number): boolean => {
    return (score1 === 3 && score2 >= 0 && score2 <= 2) ||
           (score2 === 3 && score1 >= 0 && score1 <= 2);
  };

  return (
    <div className={`match-card ${match.result ? 'completed' : 'pending'}`}>
      <div className="match-header">
        <span className="match-id">{match.id}</span>
      </div>

      <div className="match-body">
        {/* Team 1 */}
        <div className="team-row">
          <div className="team-info-wrapper">
            <div className="team-players">
              <div className="player">
                <div className="player-avatar-small">
                  {match.team1.player1.avatar ? (
                    <img src={match.team1.player1.avatar} alt={match.team1.player1.name} />
                  ) : (
                    <div className="avatar-fallback-small">🎾</div>
                  )}
                </div>
                <div className="player-info">
                  <span className="player-name">{match.team1.player1.name}</span>
                  <span className="player-rating-small">{match.team1.player1.rating}</span>
                </div>
              </div>
              <div className="player">
                <div className="player-avatar-small">
                  {match.team1.player2.avatar ? (
                    <img src={match.team1.player2.avatar} alt={match.team1.player2.name} />
                  ) : (
                    <div className="avatar-fallback-small">🎾</div>
                  )}
                </div>
                <div className="player-info">
                  <span className="player-name">{match.team1.player2.name}</span>
                  <span className="player-rating-small">{match.team1.player2.rating}</span>
                </div>
              </div>
            </div>
            <div className="team-rating-total">
              Total: {match.team1.player1.rating + match.team1.player2.rating}
            </div>
          </div>
          <div className="team-score">
            {isEditing ? (
              <select
                value={team1Score}
                onChange={(e) => setTeam1Score(parseInt(e.target.value))}
                className="score-select"
              >
                <option value={0}>0</option>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
            ) : (
              <span className="score">{match.result?.team1Score ?? '-'}</span>
            )}
          </div>
        </div>

        {/* VS Divider */}
        <div className="match-divider">
          <span className="vs-text">VS</span>
        </div>

        {/* Team 2 */}
        <div className="team-row">
          <div className="team-info-wrapper">
            <div className="team-players">
              <div className="player">
                <div className="player-avatar-small">
                  {match.team2.player1.avatar ? (
                    <img src={match.team2.player1.avatar} alt={match.team2.player1.name} />
                  ) : (
                    <div className="avatar-fallback-small">🎾</div>
                  )}
                </div>
                <div className="player-info">
                  <span className="player-name">{match.team2.player1.name}</span>
                  <span className="player-rating-small">{match.team2.player1.rating}</span>
                </div>
              </div>
              <div className="player">
                <div className="player-avatar-small">
                  {match.team2.player2.avatar ? (
                    <img src={match.team2.player2.avatar} alt={match.team2.player2.name} />
                  ) : (
                    <div className="avatar-fallback-small">🎾</div>
                  )}
                </div>
                <div className="player-info">
                  <span className="player-name">{match.team2.player2.name}</span>
                  <span className="player-rating-small">{match.team2.player2.rating}</span>
                </div>
              </div>
            </div>
            <div className="team-rating-total">
              Total: {match.team2.player1.rating + match.team2.player2.rating}
            </div>
          </div>
          <div className="team-score">
            {isEditing ? (
              <select
                value={team2Score}
                onChange={(e) => setTeam2Score(parseInt(e.target.value))}
                className="score-select"
              >
                <option value={0}>0</option>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
            ) : (
              <span className="score">{match.result?.team2Score ?? '-'}</span>
            )}
          </div>
        </div>

        {/* Rating Changes */}
        {match.result?.ratingChanges && !isEditing && (
          <div className="rating-changes-section">
            <div className="rating-change-team">
              <span>{match.team1.player1.name}: {formatRatingChange(match.result.ratingChanges[match.team1.player1.id])}</span>
              <span>{match.team1.player2.name}: {formatRatingChange(match.result.ratingChanges[match.team1.player2.id])}</span>
            </div>
            <div className="rating-change-team">
              <span>{match.team2.player1.name}: {formatRatingChange(match.result.ratingChanges[match.team2.player1.id])}</span>
              <span>{match.team2.player2.name}: {formatRatingChange(match.result.ratingChanges[match.team2.player2.id])}</span>
            </div>
          </div>
        )}
      </div>

      <div className="match-actions">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              className="btn btn-success"
              disabled={!isValidScore(team1Score, team2Score)}
            >
              Salva
            </button>
            {match.result && (
              <button onClick={handleCancel} className="btn btn-secondary">
                Annulla
              </button>
            )}
            {!isValidScore(team1Score, team2Score) && (
              <span className="error-hint">Il vincitore deve avere 3 set</span>
            )}
          </>
        ) : (
          <button onClick={() => setIsEditing(true)} className="btn btn-secondary">
            Modifica
          </button>
        )}
      </div>
    </div>
  );
};
