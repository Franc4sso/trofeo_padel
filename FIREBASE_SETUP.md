# 🔥 Setup Firebase per Trofeo Padel

Questa guida ti spiega come configurare Firebase per condividere i dati del torneo in tempo reale tra tutti i dispositivi.

## 📱 Perché Firebase?

- **Sincronizzazione in tempo reale**: Tutti vedono i cambiamenti istantaneamente
- **Gratis**: Fino a 10GB/mese e 100 connessioni simultanee
- **Funziona ovunque**: Desktop, mobile, tablet
- **Nessun server**: Zero manutenzione

## 🚀 Setup in 5 minuti

### 1. Crea un progetto Firebase

1. Vai su [Firebase Console](https://console.firebase.google.com/)
2. Clicca **"Aggiungi progetto"** o **"Add project"**
3. Nome progetto: `trofeo-padel` (o quello che vuoi)
4. Disabilita Google Analytics (non serve)
5. Clicca **"Crea progetto"**

### 2. Crea una Web App

1. Nella dashboard del progetto, clicca l'icona **Web** (`</>`)
2. Nome app: `Trofeo Padel`
3. **NON** selezionare "Firebase Hosting"
4. Clicca **"Registra app"**

### 3. Copia la configurazione

Vedrai un blocco di codice simile a questo:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyA...",
  authDomain: "trofeo-padel.firebaseapp.com",
  databaseURL: "https://trofeo-padel-default-rtdb.firebaseio.com",
  projectId: "trofeo-padel",
  storageBucket: "trofeo-padel.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

**IMPORTANTE**: Copia TUTTI questi valori!

### 4. Abilita Realtime Database

1. Nel menu laterale, vai su **"Build" → "Realtime Database"**
2. Clicca **"Crea database"** o **"Create Database"**
3. Seleziona location: **Europe (europe-west1)** (più vicino all'Italia)
4. Modalità sicurezza: Scegli **"Modalità test"** o **"Test mode"**
   - ⚠️ **ATTENZIONE**: In modalità test, chiunque abbia il link può leggere/scrivere
   - Per un torneo locale va benissimo
   - Scade dopo 30 giorni, poi devi riabilitarla
5. Clicca **"Abilita"**

### 5. Configura l'app

1. Apri il file `src/firebase/config.ts`
2. Sostituisci i valori `YOUR_...` con quelli copiati:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyA...",                    // ← Incolla qui
  authDomain: "trofeo-padel.firebaseapp.com",
  databaseURL: "https://trofeo-padel-default-rtdb.firebaseio.com",
  projectId: "trofeo-padel",
  storageBucket: "trofeo-padel.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

3. Salva il file

### 6. Testa!

```bash
npm run dev
```

Apri l'app su due browser/dispositivi diversi:
- Aggiungi un giocatore nel primo → Appare anche nel secondo! ✨
- Inserisci un risultato → Tutti lo vedono in tempo reale! 🚀

## 🔒 Sicurezza (Opzionale, ma consigliato)

Se vuoi proteggere i dati (dopo il torneo o per uso continuativo):

1. Vai su **Realtime Database → Regole** (Rules)
2. Sostituisci con queste regole:

```json
{
  "rules": {
    "tournaments": {
      "trofeo-antonacci-2025": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

Questo permette accesso solo al torneo specifico.

Per protezione totale (richiede autenticazione):

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

## 🌐 Condivisione

Per far partecipare altri al torneo:

1. **Condividi semplicemente il link dell'app** (es: `http://localhost:5173` in locale)
2. Tutti i dispositivi sulla stessa rete vedranno gli stessi dati
3. Se pubblichi online (es: Vercel, Netlify), funziona ovunque nel mondo!

## 📱 Funzionamento Locale

**Sì, funziona anche in locale!**

- Il database è su cloud Firebase
- L'app può girare su `localhost`
- Tutti sulla stessa rete Wi-Fi possono accedere a `http://TUO-IP:5173`
- Esempio: `http://192.168.1.100:5173`

Per trovare il tuo IP:
```bash
# Linux/Mac
ip addr show | grep inet

# Windows
ipconfig
```

## ❓ FAQ

### L'app funziona senza Firebase?
**Sì!** Se non configuri Firebase, usa il localStorage (solo locale).

### Posso cambiare torneo?
Sì, modifica `TOURNAMENT_ID` in `src/firebase/config.ts`:
```typescript
export const TOURNAMENT_ID = 'torneo-estate-2025';
```

### Quanti dispositivi possono connettersi?
Piano gratuito: **100 connessioni simultanee**. Più che sufficiente!

### I dati sono persistenti?
Sì, restano su Firebase finché non li cancelli manualmente.

### Come resetto il torneo?
Nell'app c'è il bottone **"Reset Torneo"** nel footer.
Oppure vai su Firebase Console → Realtime Database → Cancella il nodo.

## 🐛 Problemi?

### "Firebase non configurato, uso localStorage"
- Hai dimenticato di sostituire i valori in `config.ts`
- Controlla che NON ci siano più `YOUR_...` nel file

### "Impossibile caricare da Firebase"
- Verifica di aver abilitato Realtime Database
- Controlla le regole di sicurezza
- Guarda la console del browser (F12) per errori dettagliati

### "Errore sincronizzazione"
- Controlla la connessione internet
- Verifica che il `databaseURL` sia corretto
- Prova a ricaricare la pagina

## 📞 Supporto

Per problemi, apri una issue su GitHub o contattami.

---

**Buon torneo! 🎾**
