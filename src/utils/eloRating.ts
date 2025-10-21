import type { Player, Team, Match, MatchResult } from '../types';

// K-factor: determina quanto un risultato influenza il rating
// Valori tipici: 20-40 (più alto = più volatilità)
export const K_FACTOR = 32;

// Rating iniziale per nuovi giocatori
export const INITIAL_RATING = 1500;

/**
 * Calcola il rating totale di una squadra
 */
export function calculateTeamRating(team: Team): number {
  return team.player1.rating + team.player2.rating;
}

/**
 * Calcola la probabilità attesa di vittoria per il team A
 * Usa la formula ELO standard: E_A = 1 / (1 + 10^((R_B - R_A) / 400))
 */
export function calculateExpectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * Calcola il nuovo rating dopo un match
 * @param currentRating - Rating attuale
 * @param expectedScore - Probabilità attesa di vittoria (0-1)
 * @param actualScore - Risultato effettivo (1 = vittoria, 0 = sconfitta)
 * @param kFactor - K-factor (opzionale, default K_FACTOR)
 * @returns Nuovo rating
 */
export function calculateNewRating(
  currentRating: number,
  expectedScore: number,
  actualScore: number,
  kFactor: number = K_FACTOR
): number {
  return currentRating + kFactor * (actualScore - expectedScore);
}

/**
 * Calcola le variazioni di rating per tutti i giocatori di un match
 * La variazione della squadra viene divisa equamente tra i due giocatori
 */
export function calculateRatingChanges(
  team1: Team,
  team2: Team,
  result: MatchResult
): { [playerId: string]: number } {
  const team1Rating = calculateTeamRating(team1);
  const team2Rating = calculateTeamRating(team2);

  // Calcola probabilità attese
  const team1Expected = calculateExpectedScore(team1Rating, team2Rating);
  const team2Expected = 1 - team1Expected;

  // Determina il risultato effettivo (1 = vittoria, 0 = sconfitta)
  const team1Won = result.team1Score > result.team2Score;
  const team1Actual = team1Won ? 1 : 0;
  const team2Actual = team1Won ? 0 : 1;

  // Calcola variazione totale per ogni squadra
  const team1Change = K_FACTOR * (team1Actual - team1Expected);
  const team2Change = K_FACTOR * (team2Actual - team2Expected);

  // Dividi la variazione equamente tra i giocatori della squadra
  // (o potresti pesarla in base a statistiche individuali)
  const changes: { [playerId: string]: number } = {
    [team1.player1.id]: team1Change / 2,
    [team1.player2.id]: team1Change / 2,
    [team2.player1.id]: team2Change / 2,
    [team2.player2.id]: team2Change / 2,
  };

  return changes;
}

/**
 * Versione avanzata: calcola variazioni di rating pesate in base alle performance
 * Considera la differenza set come indicatore di performance individuale
 */
export function calculateWeightedRatingChanges(
  team1: Team,
  team2: Team,
  result: MatchResult,
  setPerformance?: {
    // Opzionale: statistiche dettagliate per pesare la distribuzione
    [playerId: string]: number;
  }
): { [playerId: string]: number } {
  const team1Rating = calculateTeamRating(team1);
  const team2Rating = calculateTeamRating(team2);

  const team1Expected = calculateExpectedScore(team1Rating, team2Rating);
  const team2Expected = 1 - team1Expected;

  const team1Won = result.team1Score > result.team2Score;
  const team1Actual = team1Won ? 1 : 0;
  const team2Actual = team1Won ? 0 : 1;

  // Calcola variazione base
  let team1Change = K_FACTOR * (team1Actual - team1Expected);
  let team2Change = K_FACTOR * (team2Actual - team2Expected);

  // Applica un moltiplicatore basato sulla dominanza (differenza set)
  const setDifference = Math.abs(result.team1Score - result.team2Score);
  // 3-0: multiplier = 1 + 2 * 0.5 = 2.0 (doppio punteggio)
  // 3-1: multiplier = 1 + 1 * 0.5 = 1.5 (50% in più)
  // 3-2: multiplier = 1 + 0 * 0.5 = 1.0 (normale)
  const dominanceMultiplier = 1 + (setDifference - 1) * 0.5;

  // Bonus per vittorie da underdog (squadra con rating più basso che vince)
  const ratingDifference = Math.abs(team1Rating - team2Rating);
  let upsetBonus = 1.0;

  // Se la differenza è > 200 punti, è considerato upset
  if (ratingDifference > 200) {
    const weakerTeamWon = (team1Rating < team2Rating && team1Won) ||
                          (team2Rating < team1Rating && !team1Won);

    if (weakerTeamWon) {
      // Bonus progressivo: 200-400 pts → 1.3x, 400-600 pts → 1.5x, 600+ → 1.8x
      upsetBonus = 1 + Math.min(ratingDifference / 400, 0.8);
    }
  }

  team1Change *= dominanceMultiplier * upsetBonus;
  team2Change *= dominanceMultiplier * upsetBonus;

  // Se non ci sono statistiche individuali, dividi equamente
  if (!setPerformance) {
    return {
      [team1.player1.id]: team1Change / 2,
      [team1.player2.id]: team1Change / 2,
      [team2.player1.id]: team2Change / 2,
      [team2.player2.id]: team2Change / 2,
    };
  }

  // Altrimenti pesa in base alle performance individuali
  // (implementazione futura quando avrai statistiche per set/game)
  return calculateRatingChanges(team1, team2, result);
}

/**
 * Applica le variazioni di rating ai giocatori
 * Ritorna una nuova lista di giocatori con rating aggiornati
 */
export function applyRatingChanges(
  players: Player[],
  changes: { [playerId: string]: number }
): Player[] {
  return players.map((player) => {
    const change = changes[player.id];
    if (change === undefined) return player;

    return {
      ...player,
      rating: Math.round(player.rating + change),
    };
  });
}

/**
 * Aggiorna i rating di tutti i giocatori dopo un match
 */
export function updatePlayerRatingsAfterMatch(
  players: Player[],
  match: Match
): Player[] {
  if (!match.result) return players;

  const changes = calculateWeightedRatingChanges(
    match.team1,
    match.team2,
    match.result
  );

  return applyRatingChanges(players, changes);
}

/**
 * Calcola un rating "strength" normalizzato (0-100) per visualizzazione
 */
export function getRatingStrength(rating: number): number {
  // Assumendo che i rating vanno da 1000 (principiante) a 2000 (esperto)
  // Normalizza su scala 0-100
  const min = 1000;
  const max = 2000;
  const normalized = ((rating - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, normalized));
}

/**
 * Ottiene una categoria descrittiva basata sul rating
 */
export function getRatingCategory(rating: number): string {
  if (rating < 1200) return 'Principiante';
  if (rating < 1400) return 'Intermedio';
  if (rating < 1600) return 'Avanzato';
  if (rating < 1800) return 'Esperto';
  return 'Maestro';
}

/**
 * Calcola il colore da visualizzare per un rating (per UI)
 */
export function getRatingColor(rating: number): string {
  if (rating < 1200) return '#6c757d'; // Grigio
  if (rating < 1400) return '#17a2b8'; // Azzurro
  if (rating < 1600) return '#28a745'; // Verde
  if (rating < 1800) return '#ffc107'; // Oro
  return '#dc3545'; // Rosso (Maestro)
}
