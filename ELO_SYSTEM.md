# Sistema di Rating ELO - Trofeo Antonacci

## Panoramica

L'applicazione utilizza un sistema di rating **ELO dinamico** per classificare i giocatori e creare accoppiamenti equilibrati. Il rating cambia dopo ogni partita in base al risultato e alla forza degli avversari.

## Come Funziona l'ELO

### Rating Iniziale

- **Rating di default**: 1500
- **Range personalizzabile**: 1000-2500
- Quando aggiungi un giocatore, puoi assegnargli un rating iniziale personalizzato

### Categorie di Rating

| Rating | Categoria |  Colore |
|--------|-----------|---------|
| < 1200 | Principiante | Grigio |
| 1200-1399 | Intermedio | Azzurro |
| 1400-1599 | Avanzato | Verde |
| 1600-1799 | Esperto | Oro |
| ≥ 1800 | Maestro | Rosso |

## Calcolo delle Variazioni di Rating

### Formula Base

Dopo ogni partita, il rating di un giocatore viene aggiornato con:

```
Nuovo Rating = Rating Attuale + K × (Risultato Effettivo - Risultato Atteso)
```

Dove:
- **K = 32** (K-factor, determina la volatilità del rating)
- **Risultato Effettivo** = 1 se vince, 0 se perde
- **Risultato Atteso** = probabilità di vittoria calcolata prima del match

### Probabilità Attesa (Expected Score)

La probabilità che la squadra A batta la squadra B è:

```
E_A = 1 / (1 + 10^((R_B - R_A) / 400))
```

Dove:
- `R_A` = Rating totale squadra A (somma rating dei due giocatori)
- `R_B` = Rating totale squadra B (somma rating dei due giocatori)

### Esempio Pratico

**Scenario:**
- Team 1: Marco (1600) + Paolo (1400) = **3000 totale**
- Team 2: Luca (1500) + Andrea (1500) = **3000 totale**

**Prima del match:**
```
E_Team1 = 1 / (1 + 10^((3000 - 3000) / 400)) = 0.5 (50% di probabilità)
```

**Dopo il match (Team 1 vince 3-1):**

1. **Variazione totale Team 1:**
   ```
   ΔRating = 32 × (1 - 0.5) = +16 punti
   ```

2. **Distribuzione ai giocatori:**
   - Marco: +16/2 = **+8** → Nuovo rating: 1608
   - Paolo: +16/2 = **+8** → Nuovo rating: 1408

3. **Team 2 (perdente):**
   - Luca: -8 → Nuovo rating: 1492
   - Andrea: -8 → Nuovo rating: 1492

### Bonus Prestazione

L'algoritmo applica un **moltiplicatore basato sulla dominanza**:

```
Moltiplicatore = 1 + (Differenza Set - 1) × 0.1
```

Esempi:
- **3-0** (dominanza totale): 1 + (3-1) × 0.1 = **1.2×** (+20% punti)
- **3-1** (vittoria netta): 1 + (2-1) × 0.1 = **1.1×** (+10% punti)
- **3-2** (vittoria risicata): 1 + (1-1) × 0.1 = **1.0×** (nessun bonus)

## Accoppiamenti Basati su ELO

### Strategia di Pairing

1. **Formazione Squadre Equilibrate**
   - I giocatori vengono ordinati per rating
   - Divisi in due gruppi: metà superiore (forti) e metà inferiore (deboli)
   - Ogni squadra = 1 giocatore forte + 1 giocatore debole
   - Questo crea squadre con rating totali simili

2. **Creazione Match Equilibrati**
   - Le squadre vengono ordinate per rating totale
   - Match creati accoppiando squadre con rating simili
   - Penalità per match troppo sbilanciati (>200 punti differenza)

3. **Anti-Ripetizione**
   - Penalità (-10 punti) per coppie già formate
   - Penalità maggiore (-30 punti) per match già giocati
   - Algoritmo prova 100 combinazioni e sceglie la migliore

### Esempio di Pairing (8 Giocatori)

**Giocatori Ordinati per Rating:**
1. Marco (1700)
2. Luca (1650)
3. Andrea (1500)
4. Giovanni (1450)
5. Paolo (1400)
6. Simone (1350)
7. Roberto (1300)
8. Francesco (1250)

**Squadre Generate:**
- Team A: Marco (1700) + Simone (1350) = **3050**
- Team B: Luca (1650) + Roberto (1300) = **2950**
- Team C: Andrea (1500) + Francesco (1250) = **2750**
- Team D: Giovanni (1450) + Paolo (1400) = **2850**

**Match:**
- Match 1: Team A (3050) vs Team B (2950) - Differenza: 100 ✓ Equilibrato
- Match 2: Team D (2850) vs Team C (2750) - Differenza: 100 ✓ Equilibrato

## Vantaggi del Sistema ELO

### 1. Fair Play
- Giocatori forti e deboli sono bilanciati nelle squadre
- Match più competitivi ed interessanti
- Tutti hanno possibilità di vincere

### 2. Crescita Personale
- Vedere il proprio rating crescere è motivante
- Tracking del progresso nel tempo
- Obiettivi chiari (raggiungere categoria successiva)

### 3. Competitività
- Vincere contro avversari forti dà più punti
- Perdere contro avversari deboli costa più punti
- Incentiva a dare sempre il massimo

### 4. Adattabilità
- Il sistema si auto-corregge nel tempo
- Rating iniziali approssimativi vengono aggiustati
- Dopo 10-15 partite, i rating sono molto accurati

## Differenze con il Sistema a Fasce

### Sistema Precedente (Fasce A/B)
- ❌ Fasce statiche (A = forti, B = deboli)
- ❌ Nessun tracking del miglioramento
- ❌ Difficile bilanciare giocatori nella stessa fascia
- ❌ Classifica basata solo su vittorie

### Sistema Attuale (ELO)
- ✅ Rating dinamico che evolve
- ✅ Tracking preciso del livello di ogni giocatore
- ✅ Accoppiamenti sempre bilanciati
- ✅ Classifica basata su rating (riflette il vero livello)

## Parametri Configurabili

### K-Factor (K = 32)

Il K-factor determina quanto velocemente cambiano i rating:
- **K piccolo** (10-20): Rating stabili, convergenza lenta
- **K medio** (30-40): Bilanciamento tra stabilità e reattività ⭐ **Consigliato**
- **K grande** (50+): Rating volatili, convergenza veloce

**Configurazione attuale:** K = 32 (valore standard)

### Rating Iniziale (1500)

- **1000-1200**: Principiante assoluto
- **1300-1500**: Giocatore medio ⭐ **Default**
- **1600-1800**: Giocatore esperto
- **1900+**: Giocatore professionista

## Best Practices

### Per Organizzatori

1. **Rating Iniziali Accurati**
   - Chiedi ai giocatori di auto-valutarsi
   - Usa partite di prova per calibrare
   - Dopo 5-10 partite i rating si stabilizzano

2. **Numero Giocatori**
   - **Minimo**: 4 giocatori (2 match simultanei)
   - **Ideale**: 8 giocatori (4 match per turno)
   - **Multipli di 4** per accoppiamenti perfetti

3. **Monitoraggio**
   - Controlla la classifica regolarmente
   - Verifica che nessun giocatore sia troppo sovra/sotto-valutato
   - Esporta i dati periodicamente

### Per Giocatori

1. **Comprendi il Sistema**
   - Rating alto = giocatore forte
   - Variazioni normali: ±10-20 punti per partita
   - Variazioni grandi: ±30-40 punti per upset inaspettati

2. **Strategia**
   - Cerca di vincere con margine ampio (3-0 > 3-2)
   - Gioca sempre al massimo (anche se favorito)
   - Il tuo rating riflette il tuo vero livello

3. **Crescita**
   - Monitora il Δ Rating (variazione dal rating iniziale)
   - Obiettivo: migliorare categoria nel tempo
   - Consistenza > vittorie fortunate

## FAQ

**Q: Cosa succede se un giocatore forte perde?**
A: Perde molti punti (fino a -30/-40) perché il risultato atteso era vittoria.

**Q: Cosa succede se un giocatore debole vince?**
A: Guadagna molti punti (fino a +30/+40) perché ha battuto le aspettative.

**Q: Il rating può scendere sotto 1000?**
A: Tecnicamente sì, ma è molto raro. Il sistema tende a stabilizzarsi.

**Q: Quanto tempo serve perché il rating sia accurato?**
A: Dopo 5-10 partite il rating diventa abbastanza affidabile. Dopo 20+ partite è molto preciso.

**Q: Posso cambiare il rating iniziale di un giocatore?**
A: Sì, prima di iniziare il torneo. Dopo, solo attraverso le partite.

**Q: Come funziona se ci sono giocatori molto disomogenei?**
A: Il sistema li bilancia automaticamente. Un giocatore 1800 + uno 1200 (=3000) affronterà due giocatori da 1500 (=3000).

## Risorse Aggiuntive

- **Wikipedia ELO**: https://en.wikipedia.org/wiki/Elo_rating_system
- **Chess.com ELO Guide**: https://www.chess.com/terms/elo-rating-chess
- **Glicko-2 (alternativa avanzata)**: http://www.glicko.net/glicko.html

---

**Versione Sistema**: ELO Standard con K=32
**Ultima modifica**: 2025-10-21
