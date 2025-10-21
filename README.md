# Trofeo Antonacci - Gestione Torneo Padel con Rating ELO

Applicazione web per gestire un torneo di padel individuale con gioco in coppie 2vs2, utilizzando un **sistema di rating ELO dinamico** per classificare i giocatori e creare accoppiamenti equilibrati.

## Caratteristiche

- **Sistema Rating ELO**: Rating dinamico che si aggiorna dopo ogni partita
- **Gestione Giocatori**: Aggiungi giocatori con rating personalizzabili (1000-2500)
- **Accoppiamenti Intelligenti**: Genera automaticamente coppie bilanciate (forte + debole)
- **Match Equilibrati**: Crea partite tra squadre con rating simili
- **Anti-Ripetizione**: Evita di ripetere le stesse coppie e match
- **Gestione Risultati**: Inserisci i risultati con calcolo automatico variazioni ELO
- **Classifica Dinamica**: Visualizza rating, variazioni, categorie e statistiche
- **Export CSV**: Esporta risultati, classifica e variazioni rating
- **Persistenza Dati**: Salvataggio automatico nel browser

## Sistema Rating ELO

### Come Funziona

Il rating ELO è un sistema di valutazione dinamico che:
- **Si aggiorna dopo ogni partita** in base al risultato
- **Tiene conto della forza degli avversari** (battere giocatori forti dà più punti)
- **Bilancia automaticamente le squadre** (forte + debole)
- **Crea match equilibrati** (squadre con rating totali simili)

### Categorie Rating

| Rating | Categoria | Descrizione |
|--------|-----------|-------------|
| < 1200 | Principiante | Nuovo al gioco |
| 1200-1399 | Intermedio | Giocatore medio |
| 1400-1599 | Avanzato | Buon livello |
| 1600-1799 | Esperto | Livello alto |
| ≥ 1800 | Maestro | Livello professionale |

### Calcolo Rating

Dopo ogni partita, il rating viene aggiornato con:
```
Nuovo Rating = Rating Attuale + K × (Risultato - Atteso)
```

Dove:
- **K = 32** (fattore di variazione)
- **Risultato** = 1 se vinci, 0 se perdi
- **Atteso** = probabilità di vittoria calcolata prima del match

**Bonus prestazione**: Vincere con margine ampio (3-0, 3-1) dà più punti!

📖 **[Guida completa al sistema ELO](./ELO_SYSTEM.md)**

### Sistema di Punteggio Partite

- **Vittoria**: 3 punti per giocatore
- **Sconfitta**: 0 punti per giocatore
- **Rating**: Varia in base a risultato e avversari

### Criteri Classifica

La classifica viene ordinata in base a:

1. **Punti totali** (3 × vittorie) - **CRITERIO PRINCIPALE**
2. **Differenza set** (ΔS = set vinti - set persi)
3. Set vinti totali
4. Rating ELO
5. Numero di vittorie
6. Ordine alfabetico

### Formato Partite

Ogni partita si gioca al meglio dei 5 set:
- Il primo team che arriva a 3 set vince
- Il risultato può essere: 3-0, 3-1, o 3-2

## Installazione

```bash
# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npm run dev

# Build per produzione
npm run build
```

## Utilizzo

### 1. Aggiungi Giocatori

- Vai alla sezione "Giocatori"
- Inserisci il nome del giocatore
- Imposta il rating iniziale (default: 1500, range: 1000-2500)
  - **1000-1200**: Principiante
  - **1300-1500**: Intermedio (consigliato per giocatori medi)
  - **1600-1800**: Esperto
- Clicca "Aggiungi Giocatore"

**Nota**: Servono almeno 4 giocatori. Se il numero non è multiplo di 4, alcuni giocatori riposeranno a turno (rotazione equa).

### 2. Inizia il Torneo

- Con almeno 4 giocatori, clicca "Inizia Torneo"
- Il sistema genera automaticamente:
  - **Squadre bilanciate**: Accoppia giocatori forti con deboli
  - **Match equilibrati**: Squadre con rating totali simili

### 3. Inserisci i Risultati

- Vai alla sezione "Partite"
- Visualizza i rating delle squadre e dei giocatori
- Seleziona il punteggio (0-3 set)
- Clicca "Salva"
- **I rating vengono aggiornati automaticamente!**
- Visualizza le variazioni ELO per ogni giocatore

### 4. Monitora la Classifica

- Vai alla sezione "Classifica"
- Visualizza:
  - **Rating attuale** di ogni giocatore
  - **Δ Rating**: variazione dal rating iniziale
  - **Categoria**: livello del giocatore
  - **Statistiche complete**: P, W, L, SV, SP, ΔS, Punti
- I giocatori sono ordinati per rating ELO

### 5. Genera Nuovi Turni

- Completa tutte le partite del turno corrente
- Clicca "Genera Nuovo Turno"
- Il sistema usa i **rating aggiornati** per creare nuovi accoppiamenti
- Evita ripetizioni di coppie e match

### 6. Esporta Risultati

- Clicca "Esporta CSV" nella sezione Classifica
- Ottieni un file con:
  - Classifica completa con rating
  - Tutti i risultati delle partite
  - Variazioni rating per ogni match

## Struttura Dati

### Player
```typescript
{
  id: string;
  name: string;
  rating: number;         // Rating ELO attuale
  initialRating: number;  // Rating iniziale per tracking
}
```

### Match
```typescript
{
  id: string;
  roundNumber: number;
  team1: { player1: Player, player2: Player };
  team2: { player1: Player, player2: Player };
  result?: {
    team1Score: number;
    team2Score: number;
    ratingChanges?: {
      [playerId: string]: number;  // Variazione rating per giocatore
    };
  };
}
```

### PlayerStats
```typescript
{
  playerId: string;
  playerName: string;
  rating: number;         // Rating ELO attuale
  initialRating: number;  // Rating iniziale
  ratingChange: number;   // Δ Rating totale
  played: number;         // Partite giocate
  wins: number;           // Vittorie
  losses: number;         // Sconfitte
  setsWon: number;        // Set vinti
  setsLost: number;       // Set persi
  setDiff: number;        // Differenza set
  points: number;         // Punti totali (3 × W)
}
```

## Tecnologie Utilizzate

- **React 19** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **CSS3** - Styling
- **LocalStorage** - Persistenza dati

## Documentazione Aggiuntiva

- 📘 **[Sistema ELO Completo](./ELO_SYSTEM.md)** - Guida dettagliata al sistema di rating
- 📝 **[Architettura Tecnica](./ARCHITECTURE.md)** - Dettagli implementazione
- 🚀 **[Quick Start](./QUICK_START.md)** - Guida rapida

## Funzionalità Future

- [ ] Tracciamento dei game (oltre ai set)
- [ ] Visualizzazione scontri diretti
- [ ] Grafico evoluzione rating nel tempo
- [ ] Sistema Glicko-2 (ELO avanzato con confidence interval)
- [ ] Statistiche avanzate per giocatore
- [ ] Export in Excel/PDF
- [ ] Sistema di playoff/eliminazione diretta
- [ ] Stampa calendario partite

## Sviluppo

```bash
# Installa dipendenze
npm install

# Modalità sviluppo con hot reload
npm run dev

# Build produzione
npm run build

# Preview build produzione
npm run preview

# Linting
npm run lint
```

## License

MIT
