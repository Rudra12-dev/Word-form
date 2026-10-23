// firebase-config.js
// ========================================================
// FIREBASE CONFIGURATION (Spark Free Plan)
// ========================================================
// 1. Go to Firebase Console: https://console.firebase.google.com/
// 2. Create a free project (Spark Plan is 100% free, no credit card required).
// 3. Click "Web" (the </> icon) to add a web application.
// 4. Copy your project configuration object and paste the values below.
// 5. In Firebase Console, go to "Build" -> "Firestore Database" -> "Create Database".
//    Select "Start in test mode" (or use the security rules provided in README.md).
// ========================================================

export const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY_HERE",
  authDomain: "PASTE_YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID"
};

// Helper to verify if the user has replaced the placeholder values
export function isFirebaseConfigured() {
  return (
    firebaseConfig.apiKey &&
    !firebaseConfig.apiKey.includes("PASTE_YOUR") &&
    firebaseConfig.projectId &&
    !firebaseConfig.projectId.includes("PASTE_YOUR")
  );
}
