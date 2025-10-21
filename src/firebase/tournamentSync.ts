import { ref, set, onValue, get } from 'firebase/database';
import { database, TOURNAMENT_ID } from './config';
import type { Tournament } from '../types';

/**
 * Rimuove ricorsivamente tutte le proprietà undefined da un oggetto
 * Firebase non accetta undefined nei valori
 */
function removeUndefined<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(removeUndefined) as T;
  }

  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const key in obj) {
      if (obj[key] !== undefined) {
        cleaned[key] = removeUndefined(obj[key]);
      }
    }
    return cleaned;
  }

  return obj;
}

/**
 * Salva il torneo su Firebase
 */
export async function saveTournamentToFirebase(tournament: Tournament): Promise<void> {
  const tournamentRef = ref(database, `tournaments/${TOURNAMENT_ID}`);
  const cleanedTournament = removeUndefined(tournament);
  await set(tournamentRef, cleanedTournament);
}

/**
 * Carica il torneo da Firebase
 */
export async function loadTournamentFromFirebase(): Promise<Tournament | null> {
  const tournamentRef = ref(database, `tournaments/${TOURNAMENT_ID}`);
  const snapshot = await get(tournamentRef);

  if (snapshot.exists()) {
    return snapshot.val() as Tournament;
  }

  return null;
}

/**
 * Ascolta i cambiamenti del torneo in tempo reale
 * @param callback - Funzione chiamata quando il torneo cambia
 * @returns Funzione per fermare l'ascolto
 */
export function subscribeTournamentChanges(
  callback: (tournament: Tournament | null) => void
): () => void {
  const tournamentRef = ref(database, `tournaments/${TOURNAMENT_ID}`);

  const unsubscribe = onValue(tournamentRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val() as Tournament);
    } else {
      callback(null);
    }
  });

  return unsubscribe;
}

/**
 * Resetta il torneo su Firebase (elimina tutti i dati)
 */
export async function resetTournamentOnFirebase(): Promise<void> {
  const tournamentRef = ref(database, `tournaments/${TOURNAMENT_ID}`);
  await set(tournamentRef, null);
}

/**
 * Verifica se Firebase è configurato correttamente
 */
export function isFirebaseConfigured(): boolean {
  try {
    // Controlla se la configurazione contiene ancora i placeholder
    return !database.app.options.apiKey?.includes('YOUR_');
  } catch {
    return false;
  }
}
