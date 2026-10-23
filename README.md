# 🔤 Word Clash - Real-Time Multiplayer Word Game

A fast-paced, real-time multiplayer word arena built with vanilla **HTML5, CSS3, JavaScript (ES6 Modules)**, and **Firebase Firestore** on the 100% free **Spark Plan** (no credit card or paid services required).

---

## 📸 Background & Aesthetic
The web app features a fluid oceanic midnight-blue background (`assets/background.jpg`) styled with modern glassmorphism (`backdrop-filter: blur(16px)`), tactile letter tiles, real-time rank updates with medals (🥇, 🥈, 🥉), animated points popups, and victory confetti.

---

## 🚀 Quick Setup Guide (Firebase Free Spark Plan)

### Step 1: Create a Free Firebase Project
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** (or *Create a project*).
3. Name your project (e.g., `word-clash-game`).
4. Disable Google Analytics (optional, for faster setup) and click **Create Project**.
   > *Note: The Firebase Spark Plan is completely free.*

---

### Step 2: Enable Firestore Database
1. In the Firebase Console left sidebar, go to **Build** → **Firestore Database**.
2. Click **Create database**.
3. Choose a server location near you and click **Next**.
4. Select **Start in test mode** (allows read/write access for testing) and click **Enable**.

#### Recommended Security Rules (Optional but Recommended)
In the **Firestore Database** tab, click **Rules** and paste:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```
Click **Publish**.

---

### Step 3: Get Your Web App Keys & Paste in Config
1. In Firebase Console, click the **Project Overview (Gear Icon)** → **Project settings**.
2. Under the **General** tab, scroll down to **Your apps** and click the Web icon (`</>`).
3. Enter an App nickname (e.g., `word-game-web`) and click **Register app**.
4. Copy the `firebaseConfig` keys shown on screen.
5. Open `js/firebase-config.js` in your project folder and paste your keys:

```javascript
export const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "word-clash-game.firebaseapp.com",
  projectId: "word-clash-game",
  storageBucket: "word-clash-game.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef..."
};
```

---

### Step 4: Run Locally
Because ES6 modules and fetch requests require an HTTP server (to load `js/dictionary.json` and Firebase ESM modules), launch a local static server:

#### Option A: Using Node.js (npx)
```bash
npx serve .
# or
npx http-server -p 8080
```

#### Option B: Using Python
```bash
python -m http.server 8000
```

Open `http://localhost:8000` or `http://localhost:8080` in your web browser.

> 💡 **Demo Mode**: If Firebase keys have not been pasted yet, the game automatically runs in **Synced Local Demo Mode** using `BroadcastChannel` and `localStorage`, allowing you to open 2 browser tabs side-by-side to test multiplayer instantly!

---

## 🎮 How to Play

### 1. Lobby (`index.html`)
- Enter your name and click **Join Game Lobby**.
- Duplicate names and empty names are automatically prevented.
- The **first player** to join becomes the **👑 Host**:
  - The host chooses the game length: **5 Rounds** (Fast) or **10 Rounds** (Full).
  - The host taps **🚀 Start Game for Everyone**.
- Non-host players see a waiting screen with live updates.
- As soon as the host starts, **all connected players are automatically redirected to `game.html`** in real time!

### 2. Word Battle (`game.html`)
- Each round presents a **6 to 10 letter English word** picked randomly and shared across all players.
- A **30-second synchronized countdown** ticks down.
- Form words using **ONLY** the letters of the main word (each letter can only be used as many times as it appears).
- Minimum word length is **3 letters**.
- Input methods:
  - **Click/Tap** letter tiles on screen.
  - **Type on keyboard**: letters automatically select unused tiles; `Backspace` removes last letter; `Spacebar` shuffles tiles; `Enter` submits!
  - **Shuffle button (🔀)** reorders unused tiles.
  - **Delete button (⌫)** removes the last letter.
  - **Submit button (✓)** validates the word.

### 3. Scoring & Bundled Dictionary
- Every submission is validated against the bundled `js/dictionary.json` (**9,000+ common English words** with short definitions).
- **Points**: $\text{Length}^2$ (e.g., 3 letters = 9 pts, 4 letters = 16 pts, 5 letters = 25 pts, etc.).
- **Full Word Bonus**: Using all letters of the main word awards a **+50 bonus**!
- Valid word:
  - Green flash on input.
  - Floating `+X pts!` popup animation.
  - Short word meaning displayed in the feedback banner.
  - Score updated immediately in Firestore.
- Invalid word or not in dictionary: Red shake + `"Wrong, try again"`.
- Already used word in current round: `"Already used, try again"`.
- Multiple players can discover and score the same word independently.

### 4. Round Flow & Live Leaderboard
- **Live Leaderboard**: Real-time rank changes with gold, silver, bronze medals (🥇, 🥈, 🥉). Highlighted row for your player.
- **Round Summary**: When the 30-second timer expires, input locks and a **5-second round summary** shows the top 3 and your discovered words.
- Next round automatically begins with a **brand new word** (words never repeat within a game).
- **Final Results**: After the final round, a celebration screen crowns the winner with **confetti blasts**, shows complete rankings, and provides a **Play Again** button that resets scores and returns everyone to the lobby.
