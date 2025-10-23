import type { Match, PlayerStats, Tournament, Standings, Player } from '../types';
import { calculateWeightedRatingChanges } from './eloRating';

/**
 * Calcola le statistiche di un singolo giocatore
 */
function calculatePlayerStats(
  player: Player,
  matches: Match[]
): PlayerStats {
  const playerId = player.id;
  const playerName = player.name;
  let wins = 0;
  let losses = 0;
  let gamesWon = 0;
  let gamesLost = 0;
  let played = 0;

  matches.forEach((match) => {
    if (!match.result) return; // Match non ancora giocato

    const isInTeam1 =
      match.team1.player1.id === playerId || match.team1.player2.id === playerId;
    const isInTeam2 =
      match.team2.player1.id === playerId || match.team2.player2.id === playerId;

    if (!isInTeam1 && !isInTeam2) return; // Giocatore non in questo match

    played++;

    const team1Won = match.result.team1Score > match.result.team2Score;

    if (isInTeam1) {
      gamesWon += match.result.team1Score;
      gamesLost += match.result.team2Score;
      if (team1Won) wins++;
      else losses++;
    } else {
      gamesWon += match.result.team2Score;
      gamesLost += match.result.team1Score;
      if (!team1Won) wins++;
      else losses++;
    }
  });

  const gameDiff = gamesWon - gamesLost;
  const points = wins * 3;
  const ratingChange = player.rating - player.initialRating;

  // Calcola i game normalizzati (GN)
  // GN = GV se il giocatore ha giocato il massimo di partite
  // GN = GV + floor(GV / partite) se ha 1 partita in meno
  const gamesNormalized = gamesWon; // Valore di default, verrà ricalcolato dopo

  return {
    playerId,
    playerName,
    playerAvatar: player.avatar,
    rating: player.rating,
    initialRating: player.initialRating,
    ratingChange,
    played,
    wins,
    losses,
    gamesWon,
    gamesLost,
    gameDiff,
    gamesNormalized,
    points,
  };
}

/**
 * Genera la classifica completa del torneo
 */
export function generateStandings(tournament: Tournament): Standings {
  if (!tournament || !tournament.players) {
    return { stats: [] };
  }

  const stats: PlayerStats[] = tournament.players.map((player) =>
    calculatePlayerStats(player, tournament.matches || [])
  );

  // Trova il massimo numero di partite giocate
  const maxPlayed = Math.max(...stats.map((s) => s.played), 0);

  // Calcola i game normalizzati (GN) per ogni giocatore
  stats.forEach((stat) => {
    if (stat.played === 0) {
      stat.gamesNormalized = 0;
    } else if (stat.played === maxPlayed) {
      // Se hai giocato il massimo, GN = GV
      stat.gamesNormalized = stat.gamesWon;
    } else {
      // Se hai 1 partita in meno, aggiungi floor(GV / partite)
      const bonus = Math.floor(stat.gamesWon / stat.played);
      stat.gamesNormalized = stat.gamesWon + bonus;
    }
  });

  // Ordina secondo i nuovi criteri di spareggio
  stats.sort((a, b) => {
    // 1. GAME NORMALIZZATI (GN) (decrescente) - CRITERIO PRINCIPALE
    if (b.gamesNormalized !== a.gamesNormalized) return b.gamesNormalized - a.gamesNormalized;

    // 2. Differenza game ΔG (decrescente)
    if (b.gameDiff !== a.gameDiff) return b.gameDiff - a.gameDiff;

    // 3. Game vinti reali (decrescente)
    if (b.gamesWon !== a.gamesWon) return b.gamesWon - a.gamesWon;

    // 4. Head-to-head: TODO implementare incontro diretto
    // Per ora saltiamo, richiederebbe analisi match specifici

    // 5. Rating ELO (crescente) - vince chi ha MENO rating
    if (a.rating !== b.rating) return a.rating - b.rating;

    // 6. Nome (alfabetico) come ultimo criterio
    return a.playerName.localeCompare(b.playerName);
  });

  return { stats };
}

/**
 * Valida il risultato di un match (deve essere al meglio dei 5 set)
 */
export function validateMatchResult(team1Score: number, team2Score: number): boolean {
  // Il vincitore deve arrivare a 3 set
  if (team1Score !== 3 && team2Score !== 3) return false;

  // Il perdente deve avere 0, 1 o 2 set
  if (team1Score === 3 && (team2Score < 0 || team2Score > 2)) return false;
  if (team2Score === 3 && (team1Score < 0 || team1Score > 2)) return false;

  return true;
}

/**
 * Aggiorna il risultato di un match e calcola i nuovi rating
 */
export function updateMatchResult(
  tournament: Tournament,
  matchId: string,
  team1Score: number,
  team2Score: number
): Tournament {
  if (!validateMatchResult(team1Score, team2Score)) {
    throw new Error('Risultato non valido. Il match deve essere al meglio dei 5 set (primo a 3 set vince).');
  }

  // Trova il match
  const match = tournament.matches.find((m) => m.id === matchId);
  if (!match) {
    throw new Error('Match non trovato');
  }

  // Calcola le variazioni di rating
  const ratingChanges = calculateWeightedRatingChanges(
    match.team1,
    match.team2,
    { team1Score, team2Score }
  );

  // Aggiorna il risultato del match con le variazioni di rating
  const updatedMatches = tournament.matches.map((m) => {
    if (m.id === matchId) {
      return {
        ...m,
        result: { team1Score, team2Score, ratingChanges },
      };
    }
    return m;
  });

  // Aggiorna i rating dei giocatori
  const updatedPlayers = tournament.players.map((player) => {
    const change = ratingChanges[player.id];
    if (change === undefined) return player;

    return {
      ...player,
      rating: Math.round(player.rating + change),
    };
  });

  return {
    ...tournament,
    matches: updatedMatches,
    players: updatedPlayers,
  };
}
