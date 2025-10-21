export interface Player {
  id: string;
  name: string;
  rating: number;  // Rating ELO del giocatore
  initialRating: number;  // Rating iniziale per tracking
  avatar?: string;  // URL o emoji per avatar giocatore
}

export interface Team {
  player1: Player;  // Primo giocatore
  player2: Player;  // Secondo giocatore
}

export interface TeamRating {
  team: Team;
  rating: number;  // Rating totale della squadra
}

export interface MatchResult {
  team1Score: number;  // Game vinti dalla squadra 1 (3-0, 3-1, 3-2)
  team2Score: number;  // Game vinti dalla squadra 2
  ratingChanges?: {
    [playerId: string]: number;  // Variazione rating per giocatore
  };
}

export interface Match {
  id: string;
  roundNumber: number;
  team1: Team;
  team2: Team;
  result?: MatchResult;
}

export interface PlayerStats {
  playerId: string;
  playerName: string;
  playerAvatar?: string;  // Avatar del giocatore
  rating: number;      // Rating ELO attuale
  initialRating: number;  // Rating iniziale
  ratingChange: number;   // Variazione rating totale
  played: number;      // P - Partite giocate
  wins: number;        // W - Vittorie
  losses: number;      // L - Sconfitte
  gamesWon: number;    // GV - Game vinti (al meglio dei 5)
  gamesLost: number;   // GP - Game persi
  gameDiff: number;    // ΔG - Differenza game
  points: number;      // Punti totali (3 × W)
}

export interface RatingHistory {
  matchId: string;
  roundNumber: number;
  previousRating: number;
  newRating: number;
  change: number;
  date: string;
}

export interface Tournament {
  id: string;
  name: string;
  players: Player[];
  matches: Match[];
  currentRound: number;
}

export interface Standings {
  stats: PlayerStats[];
}
