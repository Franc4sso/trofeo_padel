import { useState, useEffect } from 'react';
import type { Tournament, Player, Match } from './types';
import { PlayerForm } from './components/PlayerForm';
import { PlayerList } from './components/PlayerList';
import { MatchCard } from './components/MatchCard';
import { StandingsTable } from './components/StandingsTable';
import { generateRoundPairings, getRestingPlayers } from './utils/pairingAlgorithm';
import { generateStandings, updateMatchResult } from './utils/scoring';
import {
  saveTournamentToFirebase,
  loadTournamentFromFirebase,
  subscribeTournamentChanges,
  resetTournamentOnFirebase,
  isFirebaseConfigured,
} from './firebase/tournamentSync';
import './App.css';

const STORAGE_KEY = 'trofeo-padel-tournament';

function App() {
  const [tournament, setTournament] = useState<Tournament>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      id: 'tournament-1',
      name: 'Trofeo Antonacci',
      players: [],
      matches: [],
      currentRound: 0,
    };
  });

  const [currentView, setCurrentView] = useState<'setup' | 'matches' | 'standings'>('setup');
  const [isLoading, setIsLoading] = useState(true);
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Carica il torneo da Firebase al mount
  useEffect(() => {
    const loadFromFirebase = async () => {
      if (!isFirebaseConfigured()) {
        console.log('Firebase non configurato, uso localStorage');
        setIsLoading(false);
        return;
      }

      try {
        const firebaseTournament = await loadTournamentFromFirebase();
        if (firebaseTournament) {
          setTournament(firebaseTournament);
        }
        // Abilita sync anche se il database è vuoto (primo avvio)
        setSyncEnabled(true);
      } catch (error) {
        console.error('Errore caricamento Firebase:', error);
        setSyncError('Impossibile caricare da Firebase');
      } finally {
        setIsLoading(false);
      }
    };

    loadFromFirebase();
  }, []);

  // Sottoscrivi ai cambiamenti in tempo reale
  useEffect(() => {
    if (!isFirebaseConfigured() || !syncEnabled) return;

    const unsubscribe = subscribeTournamentChanges((firebaseTournament) => {
      if (firebaseTournament) {
        setTournament(firebaseTournament);
      }
    });

    return () => unsubscribe();
  }, [syncEnabled]);

  // Salva su Firebase e localStorage quando cambia
  useEffect(() => {
    if (isLoading) return;

    // Salva su Firebase se configurato (priorità per le immagini)
    if (isFirebaseConfigured() && syncEnabled) {
      saveTournamentToFirebase(tournament).catch((error) => {
        console.error('Errore salvataggio Firebase:', error);
        setSyncError('Errore sincronizzazione');
      });
    } else {
      // Salva su localStorage solo se Firebase non è disponibile
      // E solo se non ci sono immagini troppo grandi
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tournament));
      } catch (e) {
        console.warn('localStorage pieno, usa solo Firebase');
        // Ignora errore QuotaExceeded se Firebase è attivo
      }
    }
  }, [tournament, isLoading, syncEnabled]);

  const handleAddPlayer = (player: Player) => {
    setTournament((prev) => ({
      ...prev,
      players: [...(prev.players || []), player],
    }));
  };

  const handleRemovePlayer = (playerId: string) => {
    setTournament((prev) => ({
      ...prev,
      players: (prev.players || []).filter((p) => p.id !== playerId),
    }));
  };

  const handleEditPlayerRating = (playerId: string, newRating: number) => {
    setTournament((prev) => ({
      ...prev,
      players: (prev.players || []).map((p) =>
        p.id === playerId
          ? { ...p, rating: newRating, initialRating: newRating }
          : p
      ),
    }));
  };

  const handleStartTournament = () => {
    if ((tournament.players || []).length < 4) {
      alert('Servono almeno 4 giocatori per iniziare il torneo!');
      return;
    }

    handleGenerateRound();
    setCurrentView('matches');
  };

  const handleGenerateRound = () => {
    try {
      const newRound = (tournament.currentRound || 0) + 1;
      const newMatches = generateRoundPairings(
        tournament.players || [],
        tournament.matches || [],
        newRound
      );

      setTournament((prev) => ({
        ...prev,
        matches: [...(prev.matches || []), ...newMatches],
        currentRound: newRound,
      }));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Errore durante la generazione del turno');
    }
  };

  const handleUpdateMatchResult = (matchId: string, team1Score: number, team2Score: number) => {
    const updatedTournament = updateMatchResult(tournament, matchId, team1Score, team2Score);
    setTournament(updatedTournament);
  };

  const handleResetMatches = () => {
    if (confirm('Sei sicuro di voler resettare solo le partite? I giocatori verranno mantenuti.')) {
      setTournament((prev) => ({
        ...prev,
        matches: [],
        currentRound: 0,
      }));
      setCurrentView('setup');
    }
  };

  const handleResetTournament = async () => {
    if (confirm('Sei sicuro di voler resettare il torneo? Tutti i dati saranno persi.')) {
      const newTournament: Tournament = {
        id: 'tournament-1',
        name: 'Trofeo Antonacci',
        players: [],
        matches: [],
        currentRound: 0,
      };

      // Reset Firebase se configurato
      if (isFirebaseConfigured() && syncEnabled) {
        try {
          await resetTournamentOnFirebase();
          console.log('Firebase resettato con successo');
        } catch (error) {
          console.error('Errore reset Firebase:', error);
          setSyncError('Errore reset Firebase');
        }
      }

      // Reset localStorage
      localStorage.removeItem(STORAGE_KEY);

      setTournament(newTournament);
      setCurrentView('setup');
    }
  };

  const standings = generateStandings(tournament);
  const matchesByRound = (tournament.matches || []).reduce((acc, match) => {
    if (!acc[match.roundNumber]) {
      acc[match.roundNumber] = [];
    }
    acc[match.roundNumber].push(match);
    return acc;
  }, {} as Record<number, Match[]>);

  const allMatchesPlayed = (tournament.matches || []).length > 0 && tournament.matches.every((m) => m.result);

  if (isLoading) {
    return (
      <div className="app loading-screen">
        <div className="loading-content">
          <div className="spinner"></div>
          <p>Caricamento torneo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <h1>{tournament.name}</h1>
          {syncEnabled && (
            <div className="sync-indicator">
              <span className="sync-dot"></span>
              <span className="sync-text">Sincronizzato</span>
            </div>
          )}
          {syncError && (
            <div className="sync-error">
              <span>⚠️ {syncError}</span>
            </div>
          )}
        </div>
        <nav className="nav-tabs">
          <button
            className={currentView === 'setup' ? 'active' : ''}
            onClick={() => setCurrentView('setup')}
          >
            Giocatori
          </button>
          <button
            className={currentView === 'matches' ? 'active' : ''}
            onClick={() => setCurrentView('matches')}
            disabled={(tournament.matches || []).length === 0}
          >
            Partite
          </button>
          <button
            className={currentView === 'standings' ? 'active' : ''}
            onClick={() => setCurrentView('standings')}
            disabled={(tournament.matches || []).length === 0}
          >
            Classifica
          </button>
        </nav>
      </header>

      <main className="app-main">
        {currentView === 'setup' && (
          <div className="setup-view">
            <section className="section">
              <h2>Aggiungi Giocatori</h2>
              <PlayerForm onAddPlayer={handleAddPlayer} />
            </section>

            <section className="section">
              <h2>Lista Giocatori</h2>
              <PlayerList
                players={tournament.players || []}
                onRemovePlayer={handleRemovePlayer}
                onEditRating={handleEditPlayerRating}
              />
            </section>

            {(tournament.players || []).length >= 4 && tournament.currentRound === 0 && (
              <section className="section">
                <button onClick={handleStartTournament} className="btn btn-primary btn-large">
                  Inizia Torneo
                </button>
              </section>
            )}
          </div>
        )}

        {currentView === 'matches' && (
          <div className="matches-view">
            {Object.keys(matchesByRound)
              .sort((a, b) => parseInt(b) - parseInt(a))
              .map((round) => {
                const roundMatches = matchesByRound[parseInt(round)];
                const restingPlayers = getRestingPlayers(tournament.players, roundMatches);

                return (
                  <section key={round} className="section">
                    <div className="round-header">
                      <h2>Turno {round}</h2>
                      {restingPlayers.length > 0 && (
                        <div className="resting-players">
                          <span className="resting-label">In riposo:</span>
                          {restingPlayers.map((player, idx) => (
                            <span key={player.id} className="resting-player">
                              {player.name} ({player.rating})
                              {idx < restingPlayers.length - 1 && ', '}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="matches-grid">
                      {roundMatches.map((match) => (
                        <MatchCard
                          key={match.id}
                          match={match}
                          onUpdateResult={handleUpdateMatchResult}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}

            <section className="section">
              {allMatchesPlayed ? (
                <button onClick={handleGenerateRound} className="btn btn-primary btn-large">
                  Genera Nuovo Turno
                </button>
              ) : (
                <p className="info-message">Completa tutte le partite per generare un nuovo turno</p>
              )}
            </section>
          </div>
        )}

        {currentView === 'standings' && (
          <div className="standings-view">
            <section className="section">
              <h2>Classifica</h2>
              <StandingsTable standings={standings} />
            </section>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <button onClick={handleResetMatches} className="btn btn-secondary">
          Reset Partite
        </button>
        <button onClick={handleResetTournament} className="btn btn-danger">
          Reset Torneo
        </button>
      </footer>
    </div>
  );
}

export default App;
