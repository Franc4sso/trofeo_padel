import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// La tua configurazione Firebase
// IMPORTANTE: Sostituisci questi valori con quelli del tuo progetto Firebase
// Per ottenerli:
// 1. Vai su https://console.firebase.google.com/
// 2. Crea un nuovo progetto (o usa uno esistente)
// 3. Vai su Project Settings > General > Your apps
// 4. Aggiungi una Web App e copia la configurazione

const firebaseConfig = {
  apiKey: "AIzaSyDyc4vtOW-FCCRqkXNP8YftH5iai9davnA",
  authDomain: "trofeo-antonacci.firebaseapp.com",
  databaseURL: "https://trofeo-antonacci-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "trofeo-antonacci",
  storageBucket: "trofeo-antonacci.firebasestorage.app",
  messagingSenderId: "610989960905",
  appId: "1:610989960905:web:d5a2ba19b0a3a69acfa718",
  measurementId: "G-N1V7JFDH9W"
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);

// Ottieni riferimento al Realtime Database
export const database = getDatabase(app);

// ID del torneo - puoi cambiarlo per creare tornei diversi
export const TOURNAMENT_ID = 'trofeo-antonacci-2025';
