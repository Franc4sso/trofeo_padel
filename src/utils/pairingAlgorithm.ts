import type { Player, Team, Match } from '../types';
import { calculateTeamRating } from './eloRating';

/**
 * Shuffle array usando Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Ordina i giocatori per rating (dal più alto al più basso)
 */
function sortPlayersByRating(players: Player[]): Player[] {
  return [...players].sort((a, b) => b.rating - a.rating);
}

/**
 * Verifica se due giocatori hanno già giocato insieme
 */
function havePairedBefore(
  playerId1: string,
  playerId2: string,
  previousMatches: Match[]
): boolean {
  return previousMatches.some((match) => {
    const team1Ids = [match.team1.player1.id, match.team1.player2.id];
    const team2Ids = [match.team2.player1.id, match.team2.player2.id];

    const inTeam1 = team1Ids.includes(playerId1) && team1Ids.includes(playerId2);
    const inTeam2 = team2Ids.includes(playerId1) && team2Ids.includes(playerId2);

    return inTeam1 || inTeam2;
  });
}

/**
 * Verifica se due team hanno già giocato tra loro
 */
function teamsHavePlayedBefore(
  team1: Team,
  team2: Team,
  previousMatches: Match[]
): boolean {
  return previousMatches.some((match) => {
    const prevTeam1Ids = new Set([match.team1.player1.id, match.team1.player2.id]);
    const prevTeam2Ids = new Set([match.team2.player1.id, match.team2.player2.id]);

    const currentTeam1Ids = new Set([team1.player1.id, team1.player2.id]);
    const currentTeam2Ids = new Set([team2.player1.id, team2.player2.id]);

    // Verifica se è la stessa combinazione di squadre (in qualsiasi ordine)
    const match1 =
      (setEquals(prevTeam1Ids, currentTeam1Ids) && setEquals(prevTeam2Ids, currentTeam2Ids)) ||
      (setEquals(prevTeam1Ids, currentTeam2Ids) && setEquals(prevTeam2Ids, currentTeam1Ids));

    return match1;
  });
}

function setEquals<T>(set1: Set<T>, set2: Set<T>): boolean {
  if (set1.size !== set2.size) return false;
  for (const item of set1) {
    if (!set2.has(item)) return false;
  }
  return true;
}

/**
 * Conta quante volte ogni giocatore ha riposato
 */
function countRestTimes(players: Player[], previousMatches: Match[]): Map<string, number> {
  const restCount = new Map<string, number>();

  // Inizializza tutti a 0
  players.forEach(p => restCount.set(p.id, 0));

  // Per ogni turno precedente
  const rounds = new Set(previousMatches.map(m => m.roundNumber));
  rounds.forEach(round => {
    const matchesInRound = previousMatches.filter(m => m.roundNumber === round);
    const playersInRound = new Set<string>();

    matchesInRound.forEach(match => {
      playersInRound.add(match.team1.player1.id);
      playersInRound.add(match.team1.player2.id);
      playersInRound.add(match.team2.player1.id);
      playersInRound.add(match.team2.player2.id);
    });

    // Chi non ha giocato in questo turno ha riposato
    players.forEach(player => {
      if (!playersInRound.has(player.id)) {
        restCount.set(player.id, (restCount.get(player.id) || 0) + 1);
      }
    });
  });

  return restCount;
}

/**
 * Seleziona i giocatori che devono giocare in questo turno
 * Fa riposare chi ha riposato meno (rotazione equa)
 */
function selectPlayersForRound(players: Player[], previousMatches: Match[]): Player[] {
  const restCount = countRestTimes(players, previousMatches);

  // Se il numero è divisibile per 4, giocano tutti
  if (players.length % 4 === 0) {
    return players;
  }

  // Calcola quanti giocatori devono giocare
  const playersNeeded = Math.floor(players.length / 4) * 4;
  const playersToRest = players.length - playersNeeded;

  // Ordina per: 1) chi ha riposato MENO (deve riposare ora), 2) rating più basso (per equità)
  const sorted = [...players].sort((a, b) => {
    const restA = restCount.get(a.id) || 0;
    const restB = restCount.get(b.id) || 0;

    if (restA !== restB) return restA - restB; // Crescente: chi ha riposato meno viene prima
    return a.rating - b.rating; // A parità, rating più basso viene prima
  });

  // Fai riposare i primi (che hanno riposato meno)
  // Restituisci gli ultimi (che hanno riposato di più, quindi devono giocare)
  return sorted.slice(playersToRest);
}

/**
 * Genera gli accoppiamenti per un turno basati su rating ELO
 *
 * Strategia:
 * 1. Seleziona giocatori (gestisce riposo se necessario)
 * 2. Ordina i giocatori per rating
 * 3. Forma le coppie bilanciando i rating (forte + debole)
 * 4. Crea match equilibrati tra coppie con rating simili
 * 5. Cerca di evitare ripetizioni
 */
export function generateRoundPairings(
  players: Player[],
  previousMatches: Match[],
  roundNumber: number,
  maxAttempts: number = 100
): Match[] {
  if (players.length < 4) {
    throw new Error('Servono almeno 4 giocatori per generare un turno');
  }

  // Seleziona giocatori per questo turno (gestisce riposo)
  const playersForRound = selectPlayersForRound(players, previousMatches);

  let bestPairings: Match[] = [];
  let bestScore = -Infinity;

  // Prova più combinazioni e scegli la migliore
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const teams = createBalancedTeams(playersForRound);
    const matches = createBalancedMatches(teams, roundNumber);

    // Calcola score di questa configurazione
    const score = evaluatePairingQuality(matches, previousMatches);

    if (score > bestScore) {
      bestScore = score;
      bestPairings = matches;
    }

    // Se troviamo una configurazione perfetta, usala
    if (score === 0) break;
  }

  return bestPairings;
}

/**
 * Ottiene i giocatori che riposano in questo turno
 */
export function getRestingPlayers(
  players: Player[],
  matches: Match[]
): Player[] {
  const playingIds = new Set<string>();

  matches.forEach(match => {
    playingIds.add(match.team1.player1.id);
    playingIds.add(match.team1.player2.id);
    playingIds.add(match.team2.player1.id);
    playingIds.add(match.team2.player2.id);
  });

  return players.filter(p => !playingIds.has(p.id));
}

/**
 * Crea squadre bilanciate bilanciando i rating
 * Strategia: accoppia giocatori forti con giocatori deboli
 */
function createBalancedTeams(players: Player[]): Team[] {
  const sorted = sortPlayersByRating(players);
  const shuffled = shuffleArray(sorted);

  // Dividi in due gruppi: metà più forte e metà più debole
  const mid = shuffled.length / 2;
  const strongPlayers = shuffled.slice(0, mid);
  const weakPlayers = shuffled.slice(mid);

  // Shuffle i due gruppi per variare gli accoppiamenti
  const shuffledStrong = shuffleArray(strongPlayers);
  const shuffledWeak = shuffleArray(weakPlayers);

  const teams: Team[] = [];

  for (let i = 0; i < shuffledStrong.length; i++) {
    teams.push({
      player1: shuffledStrong[i],
      player2: shuffledWeak[i],
    });
  }

  return teams;
}

/**
 * Crea match bilanciati tra le squadre
 * Cerca di accoppiare squadre con rating simili
 */
function createBalancedMatches(
  teams: Team[],
  roundNumber: number
): Match[] {
  // Calcola il rating di ogni squadra
  const teamsWithRating = teams.map((team) => ({
    team,
    rating: calculateTeamRating(team),
  }));

  // Ordina per rating
  teamsWithRating.sort((a, b) => b.rating - a.rating);

  // Shuffle leggermente per variare
  const shuffled = shuffleArray(teamsWithRating);

  const matches: Match[] = [];

  for (let i = 0; i < shuffled.length; i += 2) {
    matches.push({
      id: `R${roundNumber}-M${i / 2 + 1}`,
      roundNumber,
      team1: shuffled[i].team,
      team2: shuffled[i + 1].team,
    });
  }

  return matches;
}

/**
 * Valuta la qualità di una configurazione di accoppiamenti
 * Score più alto = migliore (0 = perfetto)
 * Score negativo = ci sono ripetizioni
 */
function evaluatePairingQuality(
  matches: Match[],
  previousMatches: Match[]
): number {
  let score = 0;

  for (const match of matches) {
    const team1 = match.team1;
    const team2 = match.team2;

    // Penalità per coppie ripetute
    if (havePairedBefore(team1.player1.id, team1.player2.id, previousMatches)) {
      score -= 10;
    }
    if (havePairedBefore(team2.player1.id, team2.player2.id, previousMatches)) {
      score -= 10;
    }

    // Penalità maggiore per match ripetuti
    if (teamsHavePlayedBefore(team1, team2, previousMatches)) {
      score -= 30;
    }

    // Bonus per match equilibrati (differenza rating piccola)
    const team1Rating = calculateTeamRating(team1);
    const team2Rating = calculateTeamRating(team2);
    const ratingDiff = Math.abs(team1Rating - team2Rating);

    // Penalità per match troppo sbilanciati (oltre 200 punti di differenza)
    if (ratingDiff > 200) {
      score -= Math.floor(ratingDiff / 50);
    }
  }

  return score;
}
