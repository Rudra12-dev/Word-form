# 🎮 REAL-TIME MULTIPLAYER WORD GAME - COMPLETE CODE REPOSITORY
# ALL FILES IN ONE DOCUMENT

---
## FILE 1: `index.html` (Lobby Page)
---
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Word Clash | Real-Time Multiplayer Lobby</title>
  <link rel="stylesheet" href="css/style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
</head>
<body class="lobby-page">

  <!-- App Header -->
  <header class="app-header">
    <div class="logo-wrap">
      <div class="logo-badge">W</div>
      <div class="logo-title">WORD CLASH</div>
    </div>
    <div class="player-status-badge">
      <div class="online-dot"></div>
      <span id="header-status">Live Lobby</span>
    </div>
  </header>

  <!-- Main Lobby Container -->
  <main class="lobby-container glass-panel">
    
    <div class="lobby-hero">
      <h1>Word Clash Arena</h1>
      <p>Test your vocabulary speed against other players in real-time!</p>
    </div>

    <!-- Step 1: Join Form -->
    <div id="join-section" class="join-form">
      <div class="input-group">
        <label for="player-name-input" class="input-label">Enter Your Player Name</label>
        <input 
          type="text" 
          id="player-name-input" 
          class="text-input" 
          placeholder="e.g. Alex, Maya, Thunder..." 
          maxlength="16"
          autocomplete="off"
        >
      </div>
      <button id="btn-join" class="btn-primary">
        <span>Join Game Lobby</span>
        <span>➔</span>
      </button>
      <div id="join-error-msg" style="color: #f87171; font-size: 0.9rem; text-align: center; display: none;"></div>
    </div>

    <!-- Step 2: Joined Lobby Area -->
    <div id="in-lobby-section" style="display: none; flex-direction: column; gap: 24px;">
      
      <!-- Host Controls Panel (Shown only to Host) -->
      <div id="host-controls" class="host-controls-panel" style="display: none;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <h3 style="font-size: 1.1rem; color: #fbbf24; font-weight: 800;">👑 Host Dashboard</h3>
          <span style="font-size: 0.8rem; background: rgba(251,191,36,0.2); color: #fbbf24; padding: 2px 8px; border-radius: 4px; font-weight: 700;">You are Host</span>
        </div>

        <div class="rounds-selector">
          <label class="input-label">Select Number of Rounds:</label>
          <div class="rounds-options">
            <label class="round-radio-card active" id="card-rounds-5">
              <input type="radio" name="totalRounds" value="5" checked>
              <span>5 Rounds (Fast)</span>
            </label>
            <label class="round-radio-card" id="card-rounds-10">
              <input type="radio" name="totalRounds" value="10">
              <span>10 Rounds (Full)</span>
            </label>
          </div>
        </div>

        <button id="btn-start-game" class="btn-primary btn-start-game">
          <span>🚀 Start Game for Everyone</span>
        </button>
      </div>

      <!-- Non-Host Waiting Message -->
      <div id="non-host-waiting" class="waiting-message" style="display: none;">
        <div class="pulse-spinner"></div>
        <span>Waiting for host to start the game...</span>
      </div>

      <!-- Live Players List -->
      <div class="players-section">
        <div class="section-header">
          <div class="section-title">
            <span>Joined Players</span>
            <span id="player-count" class="player-count-pill">0</span>
          </div>
          <span style="font-size: 0.85rem; color: var(--text-muted);">Real-time Sync</span>
        </div>

        <div id="players-list-grid" class="players-grid">
          <!-- Dynamically populated -->
        </div>
      </div>

    </div>

  </main>

  <script type="module" src="js/lobby.js"></script>
</body>
</html>
```

---
## FILE 2: `game.html` (Main Game Arena)
---
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Word Clash | Live Game Arena</title>
  <link rel="stylesheet" href="css/style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
</head>
<body class="game-page">

  <!-- Confetti Canvas for Victory Animation -->
  <canvas id="confetti-canvas"></canvas>

  <!-- App Header -->
  <header class="app-header">
    <div class="logo-wrap">
      <div class="logo-badge">W</div>
      <div class="logo-title">WORD CLASH</div>
    </div>
    <div class="player-status-badge">
      <span id="player-profile-name" style="font-weight: 700;">Player</span>
      <span id="player-profile-score" style="color: #fbbf24; font-weight: 800; margin-left: 6px;">0 pts</span>
    </div>
  </header>

  <!-- Game Container: Main Play Area + Live Ranking Sidebar -->
  <main class="game-container">
    
    <!-- Mobile Leaderboard Expandable Bar -->
    <div id="mobile-rank-bar" class="mobile-leaderboard-bar">
      <div class="mobile-rank-summary">
        <span>🏆 Rank: <strong id="mobile-my-rank">#1</strong></span>
        <span>•</span>
        <span>Score: <strong id="mobile-my-score" style="color:#fbbf24;">0</strong></span>
      </div>
      <span style="font-size: 0.85rem; color: var(--primary);">View Leaderboard ▾</span>
    </div>

    <!-- Center Play Area -->
    <section class="play-area">

      <!-- Status Bar: Round Info & Synced Countdown -->
      <div class="game-status-bar glass-panel">
        <div class="round-info">
          <span class="round-subtitle">Battle Round</span>
          <span id="round-counter-text" class="round-title">Round 1 of 5</span>
        </div>

        <div id="timer-box" class="timer-box">
          <span class="timer-icon">⏳</span>
          <span id="timer-seconds" class="timer-seconds">30</span>
          <span style="font-size: 0.85rem; color: var(--text-muted);">sec</span>
        </div>
      </div>

      <!-- Live Feedback Banner (Definition, Error, Points) -->
      <div id="word-feedback-banner" class="word-feedback-banner">
        <span id="feedback-text">Form words from the tiles below!</span>
      </div>

      <!-- Current Word Input Slot -->
      <div id="input-slot-container" class="input-slot-container glass-panel">
        <div id="current-formed-word" class="current-formed-word">
          <span class="formed-placeholder">Tap tiles or type to form words...</span>
        </div>
      </div>

      <!-- Available Letter Tiles Board -->
      <div class="tiles-board glass-panel">
        <div id="tiles-grid" class="tiles-grid">
          <!-- Main word tiles dynamically rendered here -->
        </div>

        <!-- Action Controls -->
        <div class="action-controls">
          <button id="btn-shuffle" class="btn-ctrl btn-shuffle" title="Shuffle Tiles (Space)">
            <span>🔀</span>
            <span>Shuffle</span>
          </button>
          <button id="btn-delete" class="btn-ctrl btn-delete" title="Delete Last Letter (Backspace)">
            <span>⌫</span>
            <span>Delete</span>
          </button>
          <button id="btn-submit" class="btn-ctrl btn-submit" title="Submit Word (Enter)">
            <span>✓</span>
            <span>SUBMIT</span>
          </button>
        </div>
      </div>

      <!-- Player's Found Words in Current Round -->
      <div class="round-words-found glass-panel">
        <div class="words-found-header">
          <span>Words You Found This Round (<span id="found-words-count">0</span>)</span>
          <span style="color: #38bdf8; font-size: 0.8rem;">Min 3 letters</span>
        </div>
        <div id="words-found-chips" class="words-found-chips">
          <!-- Dynamic word chips -->
        </div>
      </div>

    </section>

    <!-- Side Live Ranking Panel -->
    <aside id="ranking-sidebar" class="ranking-sidebar glass-panel">
      <div class="ranking-title">
        <span>🏆 Live Leaderboard</span>
        <span id="total-players-count" style="font-size: 0.8rem; color: var(--primary);">0 Players</span>
      </div>
      <ul id="ranking-list" class="ranking-list">
        <!-- Live rank rows -->
      </ul>
    </aside>

  </main>

  <!-- MODAL: 5-Second Round Summary -->
  <div id="round-summary-modal" class="modal-overlay">
    <div class="modal-content glass-panel">
      <div class="modal-header">
        <span style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">Time's Up!</span>
        <h2 id="summary-round-title">Round Summary</h2>
        <div class="summary-timer-bar-wrap">
          <div id="summary-progress-bar" class="summary-timer-progress"></div>
        </div>
      </div>

      <div style="font-size: 0.95rem; color: var(--text-muted);">
        Next round starting in <strong id="summary-countdown-num" style="color: var(--primary);">5</strong> seconds...
      </div>

      <!-- Top 3 Round Standings -->
      <div class="summary-top-podium" id="round-top-podium">
        <!-- Dynamically populated top 3 -->
      </div>

      <!-- Current Player's Words this round -->
      <div class="my-found-words-summary">
        <h4>Words you discovered this round:</h4>
        <div id="summary-my-words-list" style="display: flex; flex-wrap: wrap; gap: 6px;">
          <!-- Word pills -->
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL: Final Results & Winner Podium -->
  <div id="final-results-modal" class="modal-overlay">
    <div class="modal-content glass-panel" style="max-width: 600px;">
      <div class="winner-crown">👑</div>
      <div>
        <span style="font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1.5px; color: #fbbf24; font-weight: 800;">Champion Winner</span>
        <h1 id="winner-name-display" class="winner-name">Player Name</h1>
        <p id="winner-score-display" style="font-size: 1.2rem; font-weight: 700; color: #e2e8f0; margin-top: 4px;">Score: 0 pts</p>
      </div>

      <!-- Full Standings List -->
      <div style="text-align: left; max-height: 240px; overflow-y: auto; background: rgba(0,0,0,0.3); border-radius: var(--radius-md); padding: 12px;">
        <h4 style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 10px; text-transform: uppercase;">Final Standings</h4>
        <ul id="final-rankings-list" class="ranking-list">
          <!-- Final rows -->
        </ul>
      </div>

      <button id="btn-play-again" class="btn-primary" style="margin-top: 10px; width: 100%;">
        <span>🔄 Play Again (Return to Lobby)</span>
      </button>
    </div>
  </div>

  <script type="module" src="js/game.js"></script>
</body>
</html>
```

---
## FILE 3: `css/style.css` (Glassmorphism, Responsiveness, Animations)
---
```css
/* style.css - Real-Time Multiplayer Word Game */
:root {
  --bg-overlay: rgba(8, 16, 36, 0.78);
  --glass-bg: rgba(16, 28, 58, 0.65);
  --glass-border: rgba(255, 255, 255, 0.12);
  --glass-border-focus: rgba(99, 179, 237, 0.6);
  --primary: #38bdf8;
  --primary-hover: #0284c7;
  --accent: #f59e0b;
  --accent-glow: rgba(245, 158, 11, 0.35);
  --success: #10b981;
  --success-glow: rgba(16, 185, 129, 0.4);
  --error: #ef4444;
  --error-glow: rgba(239, 68, 68, 0.4);
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --tile-bg: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  --tile-border: rgba(148, 163, 184, 0.25);
  --tile-active: linear-gradient(135deg, #38bdf8 0%, #2563eb 100%);
  --tile-gold: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --shadow-lg: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
}

body {
  font-family: var(--font-family);
  color: var(--text-main);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-x: hidden;
}

/* Lobby Background: Clean Midnight Lounge Theme */
body.lobby-page {
  background: radial-gradient(circle at 50% 0%, #1e3a8a 0%, #0f172a 40%, #030712 100%);
  background-attachment: fixed;
}

/* Game Page Background: Deep Oceanic Waves */
body.game-page {
  background: var(--bg-overlay) url('../assets/background.jpg') no-repeat center center fixed;
  background-size: cover;
  background-blend-mode: multiply;
}

/* Glassmorphism Card Utility */
.glass-panel {
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

/* Header & Nav */
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid var(--glass-border);
  background: rgba(10, 20, 42, 0.5);
  backdrop-filter: blur(10px);
}

.logo-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-badge {
  background: linear-gradient(135deg, #38bdf8, #6366f1);
  color: #fff;
  font-weight: 800;
  font-size: 1.25rem;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  box-shadow: 0 0 15px rgba(56, 189, 248, 0.5);
}

.logo-title {
  font-size: 1.4rem;
  font-weight: 800;
  background: linear-gradient(90deg, #ffffff, #93c5fd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
}

.player-status-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.08);
  padding: 6px 14px;
  border-radius: 30px;
  border: 1px solid var(--glass-border);
  font-size: 0.9rem;
}

.player-status-badge .online-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
}

/* LOBBY STYLES */
.lobby-container {
  max-width: 680px;
  width: 92%;
  margin: 40px auto;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.lobby-hero {
  text-align: center;
}

.lobby-hero h1 {
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 8px;
}

.lobby-hero p {
  color: var(--text-muted);
  font-size: 1rem;
}

.join-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-group {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-muted);
}

.text-input {
  width: 100%;
  padding: 16px 20px;
  background: rgba(15, 23, 42, 0.7);
  border: 1.5px solid var(--glass-border);
  border-radius: var(--radius-md);
  color: var(--text-main);
  font-size: 1.1rem;
  font-family: inherit;
  outline: none;
  transition: all 0.2s ease;
}

.text-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.4);
}

.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 24px;
  background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
  color: white;
  font-size: 1.1rem;
  font-weight: 700;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.6);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-start-game {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
}

.btn-start-game:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6);
}

/* Joined Players List */
.players-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}

.player-count-pill {
  background: rgba(56, 189, 248, 0.15);
  color: var(--primary);
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 0.85rem;
}

.players-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}

.player-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.player-card.is-you {
  border-color: var(--primary);
  background: rgba(56, 189, 248, 0.1);
}

.player-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 0.95rem;
  color: white;
  flex-shrink: 0;
}

.player-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.player-name-text {
  font-size: 0.95rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.host-badge {
  font-size: 0.7rem;
  font-weight: 700;
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.15);
  padding: 1px 6px;
  border-radius: 4px;
  width: fit-content;
  margin-top: 2px;
}

/* Host Controls Box */
.host-controls-panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 20px;
  background: rgba(14, 165, 233, 0.08);
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-radius: var(--radius-md);
}

.rounds-selector {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rounds-options {
  display: flex;
  gap: 12px;
}

.round-radio-card {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--glass-border);
  background: rgba(15, 23, 42, 0.5);
  cursor: pointer;
  font-weight: 700;
  transition: all 0.2s ease;
}

.round-radio-card input {
  display: none;
}

.round-radio-card.active {
  border-color: var(--primary);
  background: rgba(56, 189, 248, 0.2);
  color: var(--primary);
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.3);
}

.waiting-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 18px;
  color: var(--text-muted);
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-md);
  border: 1px dashed var(--glass-border);
}

.pulse-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--primary);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* GAME PAGE LAYOUT */
.game-container {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
  max-width: 1200px;
  width: 95%;
  margin: 20px auto 40px;
  flex: 1;
}

/* Mobile top leaderboard toggle bar */
.mobile-leaderboard-bar {
  display: none;
  grid-column: 1 / -1;
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  padding: 12px 18px;
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.mobile-rank-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  font-size: 0.95rem;
}

/* Play Area */
.play-area {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Game Top Header */
.game-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
}

.round-info {
  display: flex;
  flex-direction: column;
}

.round-subtitle {
  font-size: 0.8rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.round-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #fff;
}

.timer-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(15, 23, 42, 0.7);
  padding: 8px 18px;
  border-radius: 30px;
  border: 1.5px solid var(--glass-border);
  transition: all 0.3s ease;
}

.timer-box.timer-urgent {
  border-color: var(--error);
  box-shadow: 0 0 15px var(--error-glow);
  animation: pulse-urgent 1s infinite alternate;
}

@keyframes pulse-urgent {
  from { transform: scale(1); }
  to { transform: scale(1.05); }
}

.timer-icon {
  font-size: 1.2rem;
}

.timer-seconds {
  font-size: 1.5rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: #fff;
}

/* Word Form Box & Feedback */
.word-feedback-banner {
  min-height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  text-align: center;
  border-radius: var(--radius-md);
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  transform: translateY(-8px);
}

.word-feedback-banner.show-feedback {
  opacity: 1;
  transform: translateY(0);
}

.feedback-success {
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid var(--success);
  color: #a7f3d0;
}

.feedback-error {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid var(--error);
  color: #fca5a5;
}

/* Current Input Slot Box */
.input-slot-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 12px;
  position: relative;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.input-slot-container.green-flash {
  border-color: var(--success);
  box-shadow: 0 0 25px var(--success-glow);
}

.input-slot-container.red-shake {
  border-color: var(--error);
  box-shadow: 0 0 25px var(--error-glow);
  animation: shake 0.4s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-8px); }
  40%, 80% { transform: translateX(8px); }
}

.current-formed-word {
  min-height: 60px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.formed-letter-tile {
  width: 48px;
  height: 56px;
  background: linear-gradient(135deg, #0284c7 0%, #1e40af 100%);
  border: 2px solid #60a5fa;
  border-radius: var(--radius-sm);
  color: #fff;
  font-size: 1.6rem;
  font-weight: 800;
  display: grid;
  place-items: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  user-select: none;
  animation: pop-in 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes pop-in {
  0% { transform: scale(0.6); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.formed-placeholder {
  color: var(--text-muted);
  font-size: 1.1rem;
  font-style: italic;
}

/* Floating Points Popup */
.points-popup {
  position: absolute;
  top: -20px;
  right: 20px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-weight: 800;
  font-size: 1.2rem;
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.6);
  pointer-events: none;
  animation: float-up-fade 1.4s forwards cubic-bezier(0.2, 0.8, 0.2, 1);
}

@keyframes float-up-fade {
  0% { opacity: 0; transform: translateY(10px) scale(0.8); }
  30% { opacity: 1; transform: translateY(0) scale(1.15); }
  70% { opacity: 1; transform: translateY(-20px) scale(1); }
  100% { opacity: 0; transform: translateY(-40px) scale(0.9); }
}

/* Available Main Word Letter Tiles */
.tiles-board {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 24px;
}

.tiles-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  width: 100%;
}

.main-letter-tile {
  width: 58px;
  height: 68px;
  background: var(--tile-bg);
  border: 2px solid var(--tile-border);
  border-radius: var(--radius-md);
  color: #fff;
  font-size: 1.8rem;
  font-weight: 800;
  display: grid;
  place-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  user-select: none;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.main-letter-tile:hover:not(.used) {
  transform: translateY(-4px);
  border-color: var(--primary);
  box-shadow: 0 8px 18px rgba(56, 189, 248, 0.4);
}

.main-letter-tile:active:not(.used) {
  transform: translateY(0);
}

.main-letter-tile.used {
  opacity: 0.25;
  transform: scale(0.92);
  cursor: not-allowed;
  border-color: transparent;
  background: #0f172a;
}

/* Action Controls */
.action-controls {
  display: flex;
  gap: 12px;
  width: 100%;
  max-width: 480px;
}

.btn-ctrl {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 18px;
  border-radius: var(--radius-md);
  font-weight: 700;
  font-size: 1rem;
  border: 1px solid var(--glass-border);
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}

.btn-shuffle {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-main);
}

.btn-shuffle:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.25);
}

.btn-delete {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
  border-color: rgba(239, 68, 68, 0.3);
}

.btn-delete:hover {
  background: rgba(239, 68, 68, 0.25);
  border-color: var(--error);
}

.btn-submit {
  flex: 1.4;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
}

.btn-submit:hover {
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6);
  transform: translateY(-2px);
}

/* Found Words Chips */
.round-words-found {
  padding: 16px 20px;
}

.words-found-header {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-muted);
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
}

.words-found-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 120px;
  overflow-y: auto;
}

.word-chip {
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.3);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #bae6fd;
}

/* LIVE RANKING LEADERBOARD */
.ranking-sidebar {
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 16px;
  height: fit-content;
  position: sticky;
  top: 20px;
}

.ranking-title {
  font-size: 1.15rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--glass-border);
  padding-bottom: 12px;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  list-style: none;
}

.ranking-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.ranking-row.current-player {
  border-color: var(--primary);
  background: rgba(56, 189, 248, 0.15);
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.25);
}

.ranking-left {
  display: flex;
  align-items: center;
  gap: 10px;
  overflow: hidden;
}

.rank-badge {
  font-weight: 800;
  font-size: 0.9rem;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.rank-1 .rank-badge { background: transparent; font-size: 1.3rem; }
.rank-2 .rank-badge { background: transparent; font-size: 1.3rem; }
.rank-3 .rank-badge { background: transparent; font-size: 1.3rem; }

.player-label {
  font-size: 0.95rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-label .you-tag {
  font-size: 0.75rem;
  color: var(--primary);
  margin-left: 4px;
}

.ranking-score {
  font-size: 1.1rem;
  font-weight: 800;
  color: #fbbf24;
  font-variant-numeric: tabular-nums;
}

/* MODALS */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(3, 7, 18, 0.85);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  display: none;
  place-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal-overlay.active {
  display: grid;
}

.modal-content {
  max-width: 540px;
  width: 100%;
  padding: 32px 28px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: modal-enter 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes modal-enter {
  from { transform: scale(0.9) translateY(20px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}

.modal-header h2 {
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 6px;
}

.summary-timer-bar-wrap {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.summary-timer-progress {
  height: 100%;
  background: var(--primary);
  width: 100%;
  transition: width 5s linear;
}

.summary-top-podium {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 12px;
  margin: 12px 0;
}

.podium-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.05);
  flex: 1;
}

.podium-1 {
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid #f59e0b;
}

.podium-slot .medal { font-size: 1.6rem; }
.podium-slot .name { font-weight: 700; font-size: 0.95rem; }
.podium-slot .score { font-weight: 800; color: #fbbf24; }

.my-found-words-summary {
  text-align: left;
  background: rgba(0, 0, 0, 0.25);
  border-radius: var(--radius-md);
  padding: 14px;
  max-height: 150px;
  overflow-y: auto;
}

.my-found-words-summary h4 {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 8px;
  text-transform: uppercase;
}

.winner-crown {
  font-size: 3.5rem;
  animation: bounce-crown 1.5s infinite ease-in-out;
}

@keyframes bounce-crown {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.winner-name {
  font-size: 2.2rem;
  font-weight: 900;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

#confetti-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 999;
}

/* RESPONSIVENESS */
@media (max-width: 860px) {
  .game-container {
    grid-template-columns: 1fr;
    margin-top: 10px;
  }
  .mobile-leaderboard-bar { display: flex; }
  .ranking-sidebar { display: none; }
  .ranking-sidebar.mobile-open {
    display: flex;
    position: fixed;
    inset: 60px 16px auto 16px;
    z-index: 500;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8);
  }
  .main-letter-tile { width: 46px; height: 56px; font-size: 1.45rem; }
  .formed-letter-tile { width: 38px; height: 48px; font-size: 1.3rem; }
  .app-header { padding: 12px 16px; }
  .lobby-container { padding: 24px 16px; }
}
```

---
## FILE 4: `js/firebase-config.js`
---
*(Refer to section 3 above for full keys structure)*

---
## FILE 5: `js/firebase-service.js`
---
*(Refer to section 4 above for Firestore module & sync methods)*

---
## FILE 6: `js/lobby.js`
---
*(Refer to section 5 above for Lobby logic)*

---
## FILE 7: `js/game.js`
---
*(Refer to section 6 above for battle arena logic)*

---
## FILE 8: `js/confetti.js`
---
*(Refer to section 7 above for particle engine)*
