// game.js - Live Word Clash Game Controller
import { getGameService } from './firebase-service.js';
import { ConfettiCannon } from './confetti.js';

let service = null;
let currentPlayer = null;
let dictionary = {};
let candidateWords = [];
let confetti = null;

// Game State Tracking
let currentGameState = null;
let currentRoundWord = '';
let currentRoundNumber = 0;
let availableTiles = []; // [{ id, letter, isUsed }]
let formedWordTiles = []; // [{ id, letter }]
let foundWordsThisRound = new Set();
let roundTimerInterval = null;
let summaryTimerInterval = null;
let isInputLocked = false;
let hostTransitionTimeout = null;

// DOM Elements
const roundCounterText = document.getElementById('round-counter-text');
const timerSecondsText = document.getElementById('timer-seconds');
const timerBox = document.getElementById('timer-box');
const feedbackBanner = document.getElementById('word-feedback-banner');
const feedbackText = document.getElementById('feedback-text');
const inputSlotContainer = document.getElementById('input-slot-container');
const currentFormedWordEl = document.getElementById('current-formed-word');
const tilesGrid = document.getElementById('tiles-grid');
const wordsFoundChips = document.getElementById('words-found-chips');
const foundWordsCount = document.getElementById('found-words-count');
const rankingList = document.getElementById('ranking-list');
const totalPlayersCount = document.getElementById('total-players-count');

// Controls
const btnShuffle = document.getElementById('btn-shuffle');
const btnDelete = document.getElementById('btn-delete');
const btnSubmit = document.getElementById('btn-submit');

// Mobile Leaderboard
const mobileRankBar = document.getElementById('mobile-rank-bar');
const rankingSidebar = document.getElementById('ranking-sidebar');
const mobileMyRank = document.getElementById('mobile-my-rank');
const mobileMyScore = document.getElementById('mobile-my-score');
const playerProfileName = document.getElementById('player-profile-name');
const playerProfileScore = document.getElementById('player-profile-score');

// Modals
const roundSummaryModal = document.getElementById('round-summary-modal');
const summaryRoundTitle = document.getElementById('summary-round-title');
const summaryCountdownNum = document.getElementById('summary-countdown-num');
const summaryProgressBar = document.getElementById('summary-progress-bar');
const roundTopPodium = document.getElementById('round-top-podium');
const summaryMyWordsList = document.getElementById('summary-my-words-list');

const finalResultsModal = document.getElementById('final-results-modal');
const winnerNameDisplay = document.getElementById('winner-name-display');
const winnerScoreDisplay = document.getElementById('winner-score-display');
const finalRankingsList = document.getElementById('final-rankings-list');
const btnPlayAgain = document.getElementById('btn-play-again');

// 1. Initialization
async function init() {
  confetti = new ConfettiCannon('confetti-canvas');

  // Verify Player
  const stored = sessionStorage.getItem('word_clash_player');
  if (!stored) {
    window.location.href = 'index.html';
    return;
  }
  currentPlayer = JSON.parse(stored);
  playerProfileName.textContent = currentPlayer.name;

  // Load Dictionary
  try {
    const res = await fetch('js/dictionary.json');
    dictionary = await res.json();
    candidateWords = Object.keys(dictionary).filter(w => w.length >= 6 && w.length <= 10);
  } catch (err) {
    console.error('Failed to load dictionary:', err);
  }

  service = await getGameService();

  setupEventListeners();

  // Listen to players
  service.listenPlayers((players) => {
    updateLeaderboard(players);
    // Keep current player score in sync
    const me = players.find(p => p.id === currentPlayer.id);
    if (me) {
      currentPlayer = me;
      sessionStorage.setItem('word_clash_player', JSON.stringify(me));
      playerProfileScore.textContent = `${me.score || 0} pts`;
      mobileMyScore.textContent = me.score || 0;
    }
  });

  // Listen to game state
  service.listenGameState((gameState) => {
    handleGameStateUpdate(gameState);
  });
}

// 2. Game State Processing
function handleGameStateUpdate(gameState) {
  if (!gameState) return;
  currentGameState = gameState;

  // If game is in lobby status, return to index.html
  if (gameState.status === 'lobby') {
    window.location.href = 'index.html';
    return;
  }

  // Handle Game Ended
  if (gameState.status === 'ended') {
    showFinalResults();
    return;
  }

  // Handle Round Running
  if (gameState.status === 'running') {
    // Hide summary modal if open
    roundSummaryModal.classList.remove('active');

    // Check if new round started
    if (gameState.currentRound !== currentRoundNumber || gameState.roundWord !== currentRoundWord) {
      startNewRound(gameState);
    }
  }

  // Handle Summary Status
  if (gameState.status === 'summary') {
    showRoundSummary();
  }
}

// 3. Start a New Round
function startNewRound(gameState) {
  currentRoundNumber = gameState.currentRound || 1;
  currentRoundWord = (gameState.roundWord || '').toUpperCase();
  isInputLocked = false;

  roundCounterText.textContent = `Round ${currentRoundNumber} of ${gameState.totalRounds || 5}`;
  foundWordsThisRound.clear();
  wordsFoundChips.innerHTML = '';
  foundWordsCount.textContent = '0';

  clearFormedWord();
  setFeedback('Form words from the tiles below!', 'normal');

  // Build Tile Objects
  const letters = currentRoundWord.split('');
  availableTiles = letters.map((letter, idx) => ({
    id: idx,
    letter: letter,
    isUsed: false
  }));

  renderTiles();
  startSyncedCountdown(gameState.roundStartTime);
}

// 4. Synchronized Countdown Timer (30s)
function startSyncedCountdown(startTime) {
  if (roundTimerInterval) clearInterval(roundTimerInterval);

  function tick() {
    const elapsed = Math.floor((Date.now() - (startTime || Date.now())) / 1000);
    const remaining = Math.max(0, 30 - elapsed);

    timerSecondsText.textContent = remaining;

    if (remaining <= 6) {
      timerBox.classList.add('timer-urgent');
    } else {
      timerBox.classList.remove('timer-urgent');
    }

    if (remaining <= 0) {
      clearInterval(roundTimerInterval);
      handleRoundTimeOut();
    }
  }

  tick();
  roundTimerInterval = setInterval(tick, 250);
}

// 5. Round End & Transition
function handleRoundTimeOut() {
  isInputLocked = true;
  setFeedback("Time's up for this round!", 'normal');
  showRoundSummary();

  const isHost = (currentPlayer && currentGameState && currentGameState.hostId === currentPlayer.id) ||
                 (currentPlayer && currentPlayer.isHost);

  // If host, coordinate the 5s summary transition to next round or end game
  if (isHost) {
    if (hostTransitionTimeout) clearTimeout(hostTransitionTimeout);
    hostTransitionTimeout = setTimeout(async () => {
      const nextRoundNum = currentRoundNumber + 1;
      const totalRounds = currentGameState.totalRounds || 5;

      if (nextRoundNum <= totalRounds) {
        const nextWord = pickNextRoundWord(currentGameState.usedWords || []);
        await service.nextRound(nextRoundNum, nextWord);
      } else {
        await service.endGame();
      }
    }, 5000);
  }
}

function pickNextRoundWord(usedWords = []) {
  const upperUsed = usedWords.map(w => w.toUpperCase());
  const available = candidateWords.filter(w => !upperUsed.includes(w.toUpperCase()));
  if (available.length > 0) {
    return available[Math.floor(Math.random() * available.length)];
  }
  return candidateWords[Math.floor(Math.random() * candidateWords.length)];
}

// 6. Round Summary Modal (5 Seconds)
function showRoundSummary() {
  summaryRoundTitle.textContent = `Round ${currentRoundNumber} Summary`;
  roundSummaryModal.classList.add('active');

  // Animate progress bar across 5 seconds
  summaryProgressBar.style.transition = 'none';
  summaryProgressBar.style.width = '100%';
  setTimeout(() => {
    summaryProgressBar.style.transition = 'width 5s linear';
    summaryProgressBar.style.width = '0%';
  }, 50);

  let countdown = 5;
  summaryCountdownNum.textContent = countdown;
  if (summaryTimerInterval) clearInterval(summaryTimerInterval);
  summaryTimerInterval = setInterval(() => {
    countdown--;
    if (countdown >= 0) {
      summaryCountdownNum.textContent = countdown;
    }
    if (countdown <= 0) {
      clearInterval(summaryTimerInterval);
    }
  }, 1000);

  // Populate user words
  summaryMyWordsList.innerHTML = '';
  if (foundWordsThisRound.size === 0) {
    summaryMyWordsList.innerHTML = '<span style="color:var(--text-muted); font-size:0.9rem;">No words found this round. Better luck next round!</span>';
  } else {
    foundWordsThisRound.forEach(word => {
      const pill = document.createElement('span');
      pill.className = 'word-chip';
      pill.textContent = word.toUpperCase();
      summaryMyWordsList.appendChild(pill);
    });
  }
}

// 7. Render Available and Formed Tiles
function renderTiles() {
  tilesGrid.innerHTML = '';
  availableTiles.forEach(tile => {
    const tileEl = document.createElement('div');
    tileEl.className = `main-letter-tile ${tile.isUsed ? 'used' : ''}`;
    tileEl.textContent = tile.letter;
    tileEl.dataset.id = tile.id;

    tileEl.addEventListener('click', () => {
      if (!isInputLocked && !tile.isUsed) {
        selectLetterTile(tile);
      }
    });

    tilesGrid.appendChild(tileEl);
  });
}

function renderFormedWord() {
  currentFormedWordEl.innerHTML = '';
  if (formedWordTiles.length === 0) {
    currentFormedWordEl.innerHTML = '<span class="formed-placeholder">Tap tiles or type to form words...</span>';
    return;
  }

  formedWordTiles.forEach((tile, index) => {
    const letterEl = document.createElement('div');
    letterEl.className = 'formed-letter-tile';
    letterEl.textContent = tile.letter;
    letterEl.title = 'Click to return letter';

    letterEl.addEventListener('click', () => {
      if (!isInputLocked) {
        removeFormedLetter(index);
      }
    });

    currentFormedWordEl.appendChild(letterEl);
  });
}

function selectLetterTile(tile) {
  tile.isUsed = true;
  formedWordTiles.push(tile);
  renderTiles();
  renderFormedWord();
}

function removeFormedLetter(index) {
  const removed = formedWordTiles.splice(index, 1)[0];
  const orig = availableTiles.find(t => t.id === removed.id);
  if (orig) orig.isUsed = false;
  renderTiles();
  renderFormedWord();
}

function deleteLastLetter() {
  if (formedWordTiles.length === 0 || isInputLocked) return;
  removeFormedLetter(formedWordTiles.length - 1);
}

function clearFormedWord() {
  formedWordTiles.forEach(tile => {
    const orig = availableTiles.find(t => t.id === tile.id);
    if (orig) orig.isUsed = false;
  });
  formedWordTiles = [];
  renderTiles();
  renderFormedWord();
}

function shuffleAvailableTiles() {
  // Fisher-Yates shuffle only unused tiles
  const unused = availableTiles.filter(t => !t.isUsed);
  for (let i = unused.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unused[i], unused[j]] = [unused[j], unused[i]];
  }

  // Rebuild availableTiles
  let unusedIdx = 0;
  availableTiles = availableTiles.map(t => {
    if (!t.isUsed) {
      return unused[unusedIdx++];
    }
    return t;
  });

  renderTiles();
}

// 8. Word Validation & Scoring
async function submitWord() {
  if (isInputLocked) return;

  const word = formedWordTiles.map(t => t.letter).join('').toLowerCase();

  // Check minimum 3 letters
  if (word.length < 3) {
    showValidationFailure('Wrong, try again');
    return;
  }

  // Check already used by same player in this round
  if (foundWordsThisRound.has(word)) {
    showValidationFailure('Already used, try again');
    return;
  }

  // Validate against dictionary
  const definition = dictionary[word];
  if (!definition) {
    showValidationFailure('Wrong, try again');
    return;
  }

  // Word is valid!
  let points = word.length * word.length;
  let isBonus = false;

  // +50 bonus for using all letters of the main word
  if (word.length === currentRoundWord.length) {
    points += 50;
    isBonus = true;
  }

  // Save locally in current round
  foundWordsThisRound.add(word);
  foundWordsCount.textContent = foundWordsThisRound.size;

  // Add word chip
  const chip = document.createElement('span');
  chip.className = 'word-chip';
  chip.textContent = `${word.toUpperCase()} (+${points})`;
  wordsFoundChips.prepend(chip);

  // Trigger Effects
  showValidationSuccess(word, definition, points, isBonus);

  // Clear input
  clearFormedWord();

  // Immediately update player score in Firestore
  try {
    await service.updateScore(currentPlayer.id, points);
  } catch (err) {
    console.error('Failed to update score:', err);
  }
}

function showValidationSuccess(word, definition, points, isBonus) {
  // Green flash
  inputSlotContainer.classList.add('green-flash');
  setTimeout(() => inputSlotContainer.classList.remove('green-flash'), 600);

  // Feedback banner with word and definition
  const bonusTag = isBonus ? ' ⭐ +50 FULL WORD BONUS!' : '';
  setFeedback(`✓ ${word.toUpperCase()}: "${definition}" (+${points} pts)${bonusTag}`, 'success');

  // Floating Points Popup
  const popup = document.createElement('div');
  popup.className = 'points-popup';
  popup.textContent = `+${points} pts!`;
  inputSlotContainer.appendChild(popup);
  setTimeout(() => popup.remove(), 1400);
}

function showValidationFailure(message) {
  inputSlotContainer.classList.add('red-shake');
  setTimeout(() => inputSlotContainer.classList.remove('red-shake'), 450);
  setFeedback(message, 'error');
}

function setFeedback(msg, type = 'normal') {
  feedbackText.textContent = msg;
  feedbackBanner.className = 'word-feedback-banner show-feedback';

  if (type === 'success') {
    feedbackBanner.classList.add('feedback-success');
  } else if (type === 'error') {
    feedbackBanner.classList.add('feedback-error');
  }
}

// 9. Live Ranking & Leaderboard
function updateLeaderboard(players) {
  totalPlayersCount.textContent = `${players.length} Players`;

  // Sort descending by total score
  const sorted = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));

  rankingList.innerHTML = '';
  sorted.forEach((player, index) => {
    const rank = index + 1;
    const isYou = currentPlayer && player.id === currentPlayer.id;

    if (isYou) {
      mobileMyRank.textContent = `#${rank}`;
    }

    const row = document.createElement('li');
    row.className = `ranking-row rank-${rank} ${isYou ? 'current-player' : ''}`;

    let medal = `${rank}`;
    if (rank === 1) medal = '🥇';
    else if (rank === 2) medal = '🥈';
    else if (rank === 3) medal = '🥉';

    row.innerHTML = `
      <div class="ranking-left">
        <div class="rank-badge">${medal}</div>
        <div class="player-label">
          ${escapeHtml(player.name)} ${isYou ? '<span class="you-tag">(You)</span>' : ''}
        </div>
      </div>
      <div class="ranking-score">${player.score || 0}</div>
    `;
    rankingList.appendChild(row);
  });

  // Update top 3 on round summary podium
  renderRoundPodium(sorted);
}

function renderRoundPodium(sorted) {
  roundTopPodium.innerHTML = '';
  const top3 = sorted.slice(0, 3);
  top3.forEach((p, idx) => {
    const slot = document.createElement('div');
    slot.className = `podium-slot podium-${idx + 1}`;
    const medals = ['🥇', '🥈', '🥉'];
    slot.innerHTML = `
      <div class="medal">${medals[idx]}</div>
      <div class="name">${escapeHtml(p.name)}</div>
      <div class="score">${p.score || 0} pts</div>
    `;
    roundTopPodium.appendChild(slot);
  });
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// 10. Final Results Screen
function showFinalResults() {
  if (roundTimerInterval) clearInterval(roundTimerInterval);
  roundSummaryModal.classList.remove('active');
  finalResultsModal.classList.add('active');

  // Trigger Confetti
  if (confetti) {
    confetti.burst(150);
    setTimeout(() => confetti.burst(100), 700);
    setTimeout(() => confetti.burst(80), 1500);
  }

  // Populate winner
  const rows = Array.from(rankingList.children);
  if (rows.length > 0) {
    const firstPlaceName = rows[0].querySelector('.player-label')?.childNodes[0]?.textContent?.trim() || 'Winner';
    const firstPlaceScore = rows[0].querySelector('.ranking-score')?.textContent || '0';
    winnerNameDisplay.textContent = firstPlaceName;
    winnerScoreDisplay.textContent = `Champion Score: ${firstPlaceScore} pts`;
  }

  // Copy full leaderboard into final modal
  finalRankingsList.innerHTML = rankingList.innerHTML;
}

// 11. Event Listeners & Typing Support
function setupEventListeners() {
  btnShuffle.addEventListener('click', shuffleAvailableTiles);
  btnDelete.addEventListener('click', deleteLastLetter);
  btnSubmit.addEventListener('click', submitWord);

  // Mobile leaderboard drawer toggle
  mobileRankBar.addEventListener('click', () => {
    rankingSidebar.classList.toggle('mobile-open');
  });

  // Keyboard Typing
  window.addEventListener('keydown', (e) => {
    // Ignore if focus is in a form input or modal
    if (e.target.tagName === 'INPUT' || isInputLocked) return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      deleteLastLetter();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      submitWord();
    } else if (e.key === ' ') {
      e.preventDefault();
      shuffleAvailableTiles();
    } else if (/^[a-zA-Z]$/.test(e.key)) {
      // Find matching unused tile
      const pressed = e.key.toUpperCase();
      const match = availableTiles.find(t => !t.isUsed && t.letter === pressed);
      if (match) {
        selectLetterTile(match);
      }
    }
  });

  // Play Again Button (Resets game & returns to lobby)
  btnPlayAgain.addEventListener('click', async () => {
    btnPlayAgain.disabled = true;
    btnPlayAgain.innerHTML = '<span>Resetting game...</span>';
    try {
      await service.resetGame();
      window.location.href = 'index.html';
    } catch (err) {
      console.error('Failed to reset game:', err);
      window.location.href = 'index.html';
    }
  });
}

init();
