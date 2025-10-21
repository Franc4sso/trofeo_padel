# Quick Start - Trofeo Antonacci

## Avvio Rapido

```bash
# 1. Installa dipendenze (solo la prima volta)
npm install

# 2. Avvia l'applicazione
npm run dev
```

L'applicazione sarà disponibile su `http://localhost:5173`

## Esempio di Utilizzo

### Configurazione Torneo (8 giocatori)

**Fascia A (Forti):**
- Marco
- Luca
- Andrea
- Giovanni

**Fascia B:**
- Paolo
- Simone
- Roberto
- Francesco

### Flusso di Lavoro

1. **Aggiungi i giocatori** nella sezione "Giocatori"
2. **Clicca "Inizia Torneo"** - Verranno generate automaticamente 2 partite per il primo turno
3. **Inserisci i risultati** delle partite (es. 3-1, 3-2, 3-0)
4. **Visualizza la classifica** aggiornata in tempo reale
5. **Genera nuovo turno** dopo aver completato tutte le partite
6. **Ripeti** per tutti i turni desiderati
7. **Esporta in CSV** per salvare i risultati finali

## Regole Veloci

- **Vittoria = 3 punti** per giocatore
- **Sconfitta = 0 punti**
- Ogni partita: **al meglio dei 5 set** (primo a 3 vince)
- Risultati possibili: **3-0**, **3-1**, **3-2**

## Criteri di Classifica

1. Punti totali
2. Differenza set (ΔS)
3. Set vinti
4. Vittorie
5. Ordine alfabetico

## Build per Produzione

```bash
npm run build
npm run preview
```

I file di produzione saranno nella cartella `dist/`
