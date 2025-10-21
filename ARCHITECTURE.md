# Architettura Applicazione - Trofeo Antonacci

## Struttura del Progetto

```
trofeo-padel/
├── src/
│   ├── components/          # Componenti React
│   │   ├── MatchCard.tsx    # Card per visualizzare/modificare una partita
│   │   ├── PlayerForm.tsx   # Form per aggiungere giocatori
│   │   ├── PlayerList.tsx   # Lista giocatori divisi per fascia
│   │   └── StandingsTable.tsx # Tabella classifica
│   ├── utils/               # Logica di business
│   │   ├── pairingAlgorithm.ts  # Generazione accoppiamenti
│   │   ├── scoring.ts           # Calcolo punteggi e classifica
│   │   └── export.ts            # Export CSV
│   ├── types.ts             # Definizioni TypeScript
│   ├── App.tsx              # Componente principale
│   ├── App.css              # Stili globali
│   └── main.tsx             # Entry point
├── README.md                # Documentazione completa
├── QUICK_START.md           # Guida rapida
└── package.json             # Dipendenze
```

## Componenti Principali

### App.tsx
- **Stato globale**: Gestisce il torneo tramite useState
- **Persistenza**: Salva/carica dati da localStorage
- **Navigazione**: Gestisce tre view: setup, matches, standings
- **Coordinamento**: Collega tutti i componenti e le funzioni utils

### PlayerForm.tsx
- Input nome e selezione fascia
- Generazione ID univoco per ogni giocatore
- Callback per aggiungere giocatore all'app

### PlayerList.tsx
- Visualizzazione giocatori divisi in due colonne (Fascia A e B)
- Rimozione giocatori
- Contatori per fascia

### MatchCard.tsx
- Visualizzazione match con team e punteggi
- Modalità edit per inserire/modificare risultati
- Validazione risultati (primo a 3 set)
- Stato visivo (pending/completed)

### StandingsTable.tsx
- Tabella responsive con tutte le statistiche
- Evidenziazione primi 3 posti
- Colori differenziati per fascia
- Indicatori visivi (positivo/negativo per ΔS)

## Algoritmi Chiave

### pairingAlgorithm.ts

**generateRoundPairings()**
- Separa giocatori per fascia
- Genera N combinazioni random (maxAttempts)
- Scoring: penalizza ripetizioni di coppie e match
- Restituisce la combinazione con meno ripetizioni

**Strategia anti-ripetizione:**
1. Controlla se due giocatori hanno già formato una coppia
2. Controlla se due team hanno già giocato tra loro
3. Assegna punteggio negativo alle ripetizioni
4. Sceglie la combinazione migliore tra N tentativi

### scoring.ts

**generateStandings()**
- Calcola statistiche per ogni giocatore
- Ordina secondo criteri di spareggio:
  1. Punti (W × 3)
  2. Differenza set (ΔS)
  3. Set vinti totali
  4. Vittorie
  5. Nome alfabetico

**updateMatchResult()**
- Valida risultato (3-0, 3-1, 3-2)
- Aggiorna immutabilmente l'array matches
- Restituisce nuovo stato tournament

### export.ts

**exportStandingsToCSV()**
- Converte classifica in formato CSV
- Headers: Pos, Nome, Fascia, P, W, L, SV, SP, ΔS, Punti

**exportMatchesToCSV()**
- Esporta tutti i match con risultati
- Formato: Match ID, Round, Team 1, Team 2, Risultato

**downloadCSV()**
- Crea Blob con contenuto CSV
- Trigger download nel browser

## Tipi TypeScript

### Tipi Base
```typescript
Player: { id, name, fascia }
Team: { playerA, playerB }
Match: { id, roundNumber, team1, team2, result? }
Tournament: { id, name, players, matches, currentRound }
```

### Tipi Statistici
```typescript
PlayerStats: {
  playerId, playerName, fascia,
  played, wins, losses,
  setsWon, setsLost, setDiff, points
}
Standings: { stats: PlayerStats[] }
```

## Flusso Dati

### 1. Setup Iniziale
```
User Input → PlayerForm → App.handleAddPlayer →
  Update players[] → Save localStorage
```

### 2. Generazione Turno
```
Start Tournament → generateRoundPairings(players, prevMatches) →
  Smart pairing algorithm → Update matches[] → Save localStorage
```

### 3. Inserimento Risultati
```
MatchCard edit → Validation → updateMatchResult() →
  Update match.result → Trigger standings recalculation → Save localStorage
```

### 4. Visualizzazione Classifica
```
generateStandings(tournament) →
  Calculate stats for each player →
  Sort by tiebreaker rules →
  StandingsTable render
```

### 5. Export
```
Export button → exportTournamentToCSV() →
  Generate CSV string → downloadCSV() → Browser download
```

## Persistenza Dati

- **Tecnologia**: localStorage del browser
- **Key**: `trofeo-padel-tournament`
- **Formato**: JSON serializzato dell'oggetto Tournament
- **Trigger**: Ogni modifica allo stato (useEffect)
- **Caricamento**: All'avvio dell'app (useState initializer)

## Validazioni

### Regole Giocatori
- Numero giocatori Fascia A = Fascia B
- Numero giocatori per fascia deve essere pari (≥ 2)

### Regole Match
- Risultato: uno dei team deve avere 3 set
- Perdente: 0, 1 o 2 set
- No draw/pareggi

### Regole Turno
- Tutti i match del turno corrente devono essere completati
- Solo allora è possibile generare un nuovo turno

## Ottimizzazioni

1. **Pairing Algorithm**: Limita tentativi a 100 per evitare loop infiniti
2. **Immutability**: Tutti gli update usano spread operator
3. **React Keys**: Ogni elemento lista usa ID univoco
4. **Memoization opportunità**: generateStandings potrebbe usare useMemo
5. **Code Splitting**: Possibile con React.lazy per componenti pesanti

## Estensioni Future

### Funzionalità
- [ ] Tracking game (non solo set)
- [ ] Head-to-head statistics
- [ ] Playoff system
- [ ] Multi-tournament management
- [ ] Player profiles con foto
- [ ] Match scheduling con date/orari

### Tecnico
- [ ] Backend API (invece di localStorage)
- [ ] Database (PostgreSQL/MongoDB)
- [ ] Authentication
- [ ] Real-time updates (WebSocket)
- [ ] Mobile app (React Native)
- [ ] PWA support
- [ ] Unit tests (Vitest)
- [ ] E2E tests (Playwright)

## Performance Considerations

- **Small Scale**: < 100 giocatori, < 1000 match → localStorage OK
- **Medium Scale**: 100-1000 giocatori → Consider IndexedDB
- **Large Scale**: > 1000 giocatori → Backend API required

## Browser Compatibility

- **Modern browsers**: Chrome, Firefox, Safari, Edge (ultime 2 versioni)
- **localStorage**: Supportato da tutti i browser moderni
- **CSS Grid/Flexbox**: Supportato da tutti i browser moderni
- **ES6+**: Transpilato da Vite per compatibilità
