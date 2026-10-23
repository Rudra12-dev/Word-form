// firebase-service.js - Firestore Real-time Synchronization Service
import { firebaseConfig, isFirebaseConfigured } from './firebase-config.js';

let db = null;
let app = null;
let firestoreModule = null;

// Mock Fallback for local testing before user configures keys
class MockFirestoreService {
  constructor() {
    this.storageKey = 'word_clash_mock_state';
    this.listeners = { players: [], gameState: [] };
    this.broadcastChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('word_game_sync') : null;

    if (this.broadcastChannel) {
      this.broadcastChannel.onmessage = (event) => {
        if (event.data?.type === 'STATE_UPDATED') {
          this.notifySubscribers();
        }
      };
    }
  }

  getState() {
    const defaultState = {
      gameState: {
        status: 'lobby',
        hostId: null,
        totalRounds: 5,
        currentRound: 1,
        roundWord: '',
        roundStartTime: 0,
        usedWords: []
      },
      players: {}
    };
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : defaultState;
    } catch {
      return defaultState;
    }
  }

  saveState(state) {
    localStorage.setItem(this.storageKey, JSON.stringify(state));
    this.notifySubscribers();
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'STATE_UPDATED' });
    }
  }

  notifySubscribers() {
    const state = this.getState();
    const playerList = Object.values(state.players);
    this.listeners.players.forEach(cb => cb(playerList));
    this.listeners.gameState.forEach(cb => cb(state.gameState));
  }

  async checkNameAvailable(name) {
    const state = this.getState();
    const clean = name.trim().toLowerCase();
    return !Object.values(state.players).some(p => p.name.trim().toLowerCase() === clean);
  }

  async joinPlayer(name) {
    const state = this.getState();
    const isFirst = Object.keys(state.players).length === 0 || !state.gameState.hostId;
    const playerId = 'player_' + Math.random().toString(36).substr(2, 9);
    
    const newPlayer = {
      id: playerId,
      name: name.trim(),
      score: 0,
      roundScore: 0,
      isHost: isFirst,
      joinedAt: Date.now()
    };

    state.players[playerId] = newPlayer;
    if (isFirst) {
      state.gameState.hostId = playerId;
      state.gameState.status = 'lobby';
    }

    this.saveState(state);
    return newPlayer;
  }

  listenPlayers(callback) {
    this.listeners.players.push(callback);
    callback(Object.values(this.getState().players));
    return () => {
      this.listeners.players = this.listeners.players.filter(cb => cb !== callback);
    };
  }

  listenGameState(callback) {
    this.listeners.gameState.push(callback);
    callback(this.getState().gameState);
    return () => {
      this.listeners.gameState = this.listeners.gameState.filter(cb => cb !== callback);
    };
  }

  async startGame(totalRounds, firstWord) {
    const state = this.getState();
    state.gameState.status = 'running';
    state.gameState.totalRounds = parseInt(totalRounds, 10);
    state.gameState.currentRound = 1;
    state.gameState.roundWord = firstWord.toUpperCase();
    state.gameState.roundStartTime = Date.now();
    state.gameState.usedWords = [firstWord.toUpperCase()];

    // Reset round scores
    Object.values(state.players).forEach(p => {
      p.roundScore = 0;
    });

    this.saveState(state);
  }

  async nextRound(roundNumber, word) {
    const state = this.getState();
    state.gameState.status = 'running';
    state.gameState.currentRound = roundNumber;
    state.gameState.roundWord = word.toUpperCase();
    state.gameState.roundStartTime = Date.now();
    if (!state.gameState.usedWords.includes(word.toUpperCase())) {
      state.gameState.usedWords.push(word.toUpperCase());
    }

    Object.values(state.players).forEach(p => {
      p.roundScore = 0;
    });

    this.saveState(state);
  }

  async setRoundSummary() {
    const state = this.getState();
    state.gameState.status = 'summary';
    this.saveState(state);
  }

  async endGame() {
    const state = this.getState();
    state.gameState.status = 'ended';
    this.saveState(state);
  }

  async updateScore(playerId, points) {
    const state = this.getState();
    if (state.players[playerId]) {
      state.players[playerId].score = (state.players[playerId].score || 0) + points;
      state.players[playerId].roundScore = (state.players[playerId].roundScore || 0) + points;
      this.saveState(state);
    }
  }

  async resetGame() {
    const state = this.getState();
    state.gameState.status = 'lobby';
    state.gameState.currentRound = 1;
    state.gameState.roundWord = '';
    state.gameState.usedWords = [];
    Object.values(state.players).forEach(p => {
      p.score = 0;
      p.roundScore = 0;
    });
    this.saveState(state);
  }
}

// Actual Firebase Firestore Service
class FirestoreService {
  constructor() {
    this.isReady = false;
  }

  async init() {
    try {
      const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
      const { 
        getFirestore, 
        collection, 
        doc, 
        setDoc, 
        getDoc, 
        getDocs, 
        updateDoc, 
        onSnapshot, 
        query, 
        where, 
        increment, 
        serverTimestamp 
      } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');

      app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      firestoreModule = {
        collection, doc, setDoc, getDoc, getDocs, updateDoc, onSnapshot, query, where, increment, serverTimestamp
      };
      this.isReady = true;
      console.log('Firebase Firestore initialized successfully.');
    } catch (err) {
      console.error('Failed to initialize Firebase SDK:', err);
      throw err;
    }
  }

  async checkNameAvailable(name) {
    const { collection, getDocs } = firestoreModule;
    const playersRef = collection(db, 'players');
    const snapshot = await getDocs(playersRef);
    const clean = name.trim().toLowerCase();
    let isAvailable = true;
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.name && data.name.trim().toLowerCase() === clean) {
        isAvailable = false;
      }
    });
    return isAvailable;
  }

  async joinPlayer(name) {
    const { collection, doc, setDoc, getDocs, getDoc } = firestoreModule;
    const playersRef = collection(db, 'players');
    const existingSnap = await getDocs(playersRef);
    const isFirst = existingSnap.empty;

    const gameDocRef = doc(db, 'gameState', 'current');
    const gameDocSnap = await getDoc(gameDocRef);
    let shouldBeHost = isFirst;
    if (!gameDocSnap.exists() || !gameDocSnap.data().hostId) {
      shouldBeHost = true;
    }

    const playerId = 'player_' + Math.random().toString(36).substr(2, 9);
    const playerDocRef = doc(db, 'players', playerId);

    const playerData = {
      id: playerId,
      name: name.trim(),
      score: 0,
      roundScore: 0,
      isHost: shouldBeHost,
      joinedAt: Date.now()
    };

    await setDoc(playerDocRef, playerData);

    if (shouldBeHost) {
      await setDoc(gameDocRef, {
        status: 'lobby',
        hostId: playerId,
        totalRounds: 5,
        currentRound: 1,
        roundWord: '',
        roundStartTime: 0,
        usedWords: []
      }, { merge: true });
    }

    return playerData;
  }

  listenPlayers(callback) {
    const { collection, onSnapshot } = firestoreModule;
    const playersRef = collection(db, 'players');
    return onSnapshot(playersRef, (snapshot) => {
      const players = [];
      snapshot.forEach(d => players.push(d.data()));
      callback(players);
    }, (err) => {
      console.error('Error listening to players:', err);
    });
  }

  listenGameState(callback) {
    const { doc, onSnapshot } = firestoreModule;
    const gameDocRef = doc(db, 'gameState', 'current');
    return onSnapshot(gameDocRef, (snap) => {
      if (snap.exists()) {
        callback(snap.data());
      }
    }, (err) => {
      console.error('Error listening to game state:', err);
    });
  }

  async startGame(totalRounds, firstWord) {
    const { doc, updateDoc, collection, getDocs } = firestoreModule;
    const gameDocRef = doc(db, 'gameState', 'current');
    await updateDoc(gameDocRef, {
      status: 'running',
      totalRounds: parseInt(totalRounds, 10),
      currentRound: 1,
      roundWord: firstWord.toUpperCase(),
      roundStartTime: Date.now(),
      usedWords: [firstWord.toUpperCase()]
    });

    // Reset round scores
    const playersRef = collection(db, 'players');
    const snap = await getDocs(playersRef);
    snap.forEach(async (d) => {
      await updateDoc(doc(db, 'players', d.id), { roundScore: 0 });
    });
  }

  async nextRound(roundNumber, word) {
    const { doc, updateDoc, collection, getDocs } = firestoreModule;
    const gameDocRef = doc(db, 'gameState', 'current');
    const gameSnap = await firestoreModule.getDoc(gameDocRef);
    const existingUsed = gameSnap.data()?.usedWords || [];
    
    if (!existingUsed.includes(word.toUpperCase())) {
      existingUsed.push(word.toUpperCase());
    }

    await updateDoc(gameDocRef, {
      status: 'running',
      currentRound: roundNumber,
      roundWord: word.toUpperCase(),
      roundStartTime: Date.now(),
      usedWords: existingUsed
    });

    const playersRef = collection(db, 'players');
    const snap = await getDocs(playersRef);
    snap.forEach(async (d) => {
      await updateDoc(doc(db, 'players', d.id), { roundScore: 0 });
    });
  }

  async setRoundSummary() {
    const { doc, updateDoc } = firestoreModule;
    const gameDocRef = doc(db, 'gameState', 'current');
    await updateDoc(gameDocRef, { status: 'summary' });
  }

  async endGame() {
    const { doc, updateDoc } = firestoreModule;
    const gameDocRef = doc(db, 'gameState', 'current');
    await updateDoc(gameDocRef, { status: 'ended' });
  }

  async updateScore(playerId, points) {
    const { doc, updateDoc, increment } = firestoreModule;
    const playerRef = doc(db, 'players', playerId);
    await updateDoc(playerRef, {
      score: increment(points),
      roundScore: increment(points)
    });
  }

  async resetGame() {
    const { doc, updateDoc, collection, getDocs } = firestoreModule;
    const gameDocRef = doc(db, 'gameState', 'current');
    await updateDoc(gameDocRef, {
      status: 'lobby',
      currentRound: 1,
      roundWord: '',
      usedWords: []
    });

    const playersRef = collection(db, 'players');
    const snap = await getDocs(playersRef);
    snap.forEach(async (d) => {
      await updateDoc(doc(db, 'players', d.id), {
        score: 0,
        roundScore: 0
      });
    });
  }
}

// Export singleton instance based on whether Firebase is configured
let activeService = null;

export async function getGameService() {
  if (activeService) return activeService;

  if (isFirebaseConfigured()) {
    try {
      const service = new FirestoreService();
      await service.init();
      activeService = service;
      return service;
    } catch (e) {
      console.warn('Falling back to mock service due to initialization error:', e);
      activeService = new MockFirestoreService();
      return activeService;
    }
  } else {
    console.info('Firebase keys not configured in firebase-config.js. Using synced Local Demo Service.');
    activeService = new MockFirestoreService();
    return activeService;
  }
}
