// lobby.js - Real-time Lobby Controller
import { getGameService } from './firebase-service.js';

let service = null;
let currentPlayer = null;
let chosenRounds = 5;

// DOM Elements
const joinSection = document.getElementById('join-section');
const inLobbySection = document.getElementById('in-lobby-section');
const playerNameInput = document.getElementById('player-name-input');
const btnJoin = document.getElementById('btn-join');
const joinErrorMsg = document.getElementById('join-error-msg');

const hostControls = document.getElementById('host-controls');
const nonHostWaiting = document.getElementById('non-host-waiting');
const btnStartGame = document.getElementById('btn-start-game');
const playersListGrid = document.getElementById('players-list-grid');
const playerCountBadge = document.getElementById('player-count');

const cardRounds5 = document.getElementById('card-rounds-5');
const cardRounds10 = document.getElementById('card-rounds-10');

// List of candidate words for the host to pick from
let candidateWords = [];

async function loadCandidateWords() {
  try {
    const res = await fetch('js/dictionary.json');
    const dict = await res.json();
    candidateWords = Object.keys(dict).filter(w => w.length >= 6 && w.length <= 10);
  } catch (err) {
    console.error('Could not load dictionary for round words, using fallback:', err);
    candidateWords = ['PLANETS', 'GARDEN', 'CASTLE', 'STREAM', 'SILVER', 'BRIGHT', 'SPRING', 'SUMMER', 'WINTER', 'FOREST', 'FRIEND', 'BRIDGE', 'ISLAND', 'TRAVEL', 'MASTER', 'YELLOW', 'ORANGE', 'DOLPHIN', 'CHAMPION', 'RAINBOW'];
  }
}

function getRandomTargetWord(usedWords = []) {
  const available = candidateWords.filter(w => !usedWords.includes(w.toUpperCase()));
  if (available.length === 0) {
    return candidateWords[Math.floor(Math.random() * candidateWords.length)];
  }
  return available[Math.floor(Math.random() * available.length)];
}

function showError(msg) {
  joinErrorMsg.textContent = msg;
  joinErrorMsg.style.display = 'block';
}

function clearError() {
  joinErrorMsg.textContent = '';
  joinErrorMsg.style.display = 'none';
}

// Check existing session
function checkExistingPlayer() {
  try {
    const stored = sessionStorage.getItem('word_clash_player');
    if (stored) {
      currentPlayer = JSON.parse(stored);
      showLobbyScreen();
    }
  } catch (e) {
    console.warn('Session read error:', e);
  }
}

function showLobbyScreen() {
  joinSection.style.display = 'none';
  inLobbySection.style.display = 'flex';
}

async function handleJoin() {
  clearError();
  const name = playerNameInput.value.trim();

  if (!name) {
    showError('Please enter a valid player name.');
    return;
  }

  if (name.length < 2) {
    showError('Name must be at least 2 characters long.');
    return;
  }

  btnJoin.disabled = true;
  btnJoin.innerHTML = '<span>Checking...</span>';

  try {
    const isAvailable = await service.checkNameAvailable(name);
    if (!isAvailable) {
      showError(`The name "${name}" is already taken. Please choose another.`);
      btnJoin.disabled = false;
      btnJoin.innerHTML = '<span>Join Game Lobby</span><span>➔</span>';
      return;
    }

    const player = await service.joinPlayer(name);
    currentPlayer = player;
    sessionStorage.setItem('word_clash_player', JSON.stringify(player));
    showLobbyScreen();
  } catch (err) {
    console.error('Join error:', err);
    showError('Failed to join lobby. Please check connection and try again.');
  } finally {
    btnJoin.disabled = false;
    btnJoin.innerHTML = '<span>Join Game Lobby</span><span>➔</span>';
  }
}

function renderPlayers(players, gameState) {
  playerCountBadge.textContent = players.length;
  playersListGrid.innerHTML = '';

  const isHost = (currentPlayer && gameState && gameState.hostId === currentPlayer.id) || 
                 (currentPlayer && currentPlayer.isHost);

  // Update Host vs Non-Host view
  if (isHost) {
    hostControls.style.display = 'flex';
    nonHostWaiting.style.display = 'none';
  } else {
    hostControls.style.display = 'none';
    nonHostWaiting.style.display = 'flex';
  }

  // Sort players by join order
  const sorted = [...players].sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0));

  sorted.forEach(p => {
    const card = document.createElement('div');
    const isYou = currentPlayer && p.id === currentPlayer.id;
    card.className = `player-card ${isYou ? 'is-you' : ''}`;

    const initial = (p.name || '?').charAt(0).toUpperCase();
    const isThisPlayerHost = (gameState && gameState.hostId === p.id) || p.isHost;

    card.innerHTML = `
      <div class="player-avatar">${initial}</div>
      <div class="player-info">
        <div class="player-name-text">
          ${escapeHtml(p.name)} ${isYou ? '<span style="color:var(--primary); font-size:0.8rem;">(You)</span>' : ''}
        </div>
        ${isThisPlayerHost ? '<span class="host-badge">👑 Host</span>' : ''}
      </div>
    `;
    playersListGrid.appendChild(card);
  });
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function handleStartGame() {
  if (!btnStartGame) return;
  btnStartGame.disabled = true;
  btnStartGame.innerHTML = '<span>Starting Game...</span>';

  try {
    const firstWord = getRandomTargetWord([]);
    await service.startGame(chosenRounds, firstWord);
    // Game state listener will redirect all clients to game.html
  } catch (err) {
    console.error('Failed to start game:', err);
    btnStartGame.disabled = false;
    btnStartGame.innerHTML = '<span>🚀 Start Game for Everyone</span>';
    alert('Failed to start game. Please try again.');
  }
}

// Setup Event Listeners
function setupListeners() {
  btnJoin.addEventListener('click', handleJoin);
  playerNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleJoin();
  });

  // Rounds selector
  cardRounds5.addEventListener('click', () => {
    chosenRounds = 5;
    cardRounds5.classList.add('active');
    cardRounds10.classList.remove('active');
    cardRounds5.querySelector('input').checked = true;
  });

  cardRounds10.addEventListener('click', () => {
    chosenRounds = 10;
    cardRounds10.classList.add('active');
    cardRounds5.classList.remove('active');
    cardRounds10.querySelector('input').checked = true;
  });

  btnStartGame.addEventListener('click', handleStartGame);
}

// Initialize
async function init() {
  setupListeners();
  await loadCandidateWords();
  service = await getGameService();

  checkExistingPlayer();

  let latestGameState = null;

  // Listen to game state
  service.listenGameState((gameState) => {
    latestGameState = gameState;
    if (gameState?.status === 'running') {
      // Auto-redirect ALL players to game.html
      window.location.href = 'game.html';
    }
  });

  // Listen to players
  service.listenPlayers((players) => {
    // If currentPlayer is saved in session, ensure their host status is up to date
    if (currentPlayer) {
      const match = players.find(p => p.id === currentPlayer.id);
      if (match) {
        currentPlayer = match;
        sessionStorage.setItem('word_clash_player', JSON.stringify(match));
      }
    }
    renderPlayers(players, latestGameState);
  });
}

init();
