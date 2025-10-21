import { useState } from 'react';
import type { Player } from '../types';
import { INITIAL_RATING } from '../utils/eloRating';
import { compressImage, getBase64Size } from '../utils/imageCompression';

interface PlayerFormProps {
  onAddPlayer: (player: Player) => void;
}

export const PlayerForm: React.FC<PlayerFormProps> = ({ onAddPlayer }) => {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(INITIAL_RATING);
  const [avatar, setAvatar] = useState<string>('');
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      try {
        // Comprimi immagine a max 50KB
        const compressed = await compressImage(file, 200, 200, 0.7);
        const sizeKB = getBase64Size(compressed);

        console.log(`Immagine compressa: ${sizeKB}KB`);

        setAvatar(compressed);
        setAvatarPreview(compressed);
      } catch (error) {
        console.error('Errore compressione immagine:', error);
        alert('Errore durante il caricamento dell\'immagine');
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() === '') return;

    const player: Player = {
      id: `player_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: name.trim(),
      rating: rating,
      initialRating: rating,
      ...(avatar && { avatar }), // Include avatar solo se presente
    };

    onAddPlayer(player);
    setName('');
    setRating(INITIAL_RATING);
    setAvatar('');
    setAvatarPreview('');
  };

  return (
    <form onSubmit={handleSubmit} className="player-form">
      <div className="avatar-upload">
        <label htmlFor="avatar-input" className="avatar-upload-label">
          {isCompressing ? (
            <div className="avatar-placeholder">
              <div className="spinner-small"></div>
              <span>Compressione...</span>
            </div>
          ) : avatarPreview ? (
            <img src={avatarPreview} alt="Avatar preview" className="avatar-preview" />
          ) : (
            <div className="avatar-placeholder">
              <span>📷</span>
              <span>Carica foto</span>
            </div>
          )}
        </label>
        <input
          id="avatar-input"
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="avatar-input"
          disabled={isCompressing}
        />
      </div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nome giocatore"
        className="input"
        required
      />
      <div className="rating-input-group">
        <label htmlFor="rating">Rating iniziale:</label>
        <input
          id="rating"
          type="number"
          value={rating}
          onChange={(e) => setRating(parseInt(e.target.value) || INITIAL_RATING)}
          min="1000"
          max="2500"
          step="50"
          className="input input-rating"
        />
        <span className="rating-hint">(1000-2500, default: {INITIAL_RATING})</span>
      </div>
      <button type="submit" className="btn btn-primary">
        Aggiungi Giocatore
      </button>
    </form>
  );
};
