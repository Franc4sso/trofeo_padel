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
  let setsWon = 0;
  let setsLost = 0;
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
      setsWon += match.result.team1Score;
      setsLost += match.result.team2Score;
      if (team1Won) wins++;
      else losses++;
    } else {
      setsWon += match.result.team2Score;
      setsLost += match.result.team1Score;
      if (!team1Won) wins++;
      else losses++;
    }
  });

  const setDiff = setsWon - setsLost;
  const points = wins * 3;
  const ratingChange = player.rating - player.initialRating;

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
    setsWon,
    setsLost,
    setDiff,
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

  // Ordina secondo i criteri di spareggio
  stats.sort((a, b) => {
    // 1. Punti totali (decrescente) - CRITERIO PRINCIPALE
    if (b.points !== a.points) return b.points - a.points;

    // 2. Differenza set (decrescente)
    if (b.setDiff !== a.setDiff) return b.setDiff - a.setDiff;

    // 3. Set vinti totali (decrescente)
    if (b.setsWon !== a.setsWon) return b.setsWon - a.setsWon;

    // 4. Rating ELO (crescente) - vince chi ha MENO rating
    if (a.rating !== b.rating) return a.rating - b.rating;

    // 5. Vittorie (decrescente)
    if (b.wins !== a.wins) return b.wins - a.wins;

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
