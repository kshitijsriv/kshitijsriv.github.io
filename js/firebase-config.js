// Firebase configuration for v8 compat SDK (used by this website)
const firebaseConfig = {
  apiKey: "AIzaSyAzGyyvZpOY_nNaiFK1OE7Ch_qynX0Faxg",
  authDomain: "personal-website-11fe3.firebaseapp.com",
  projectId: "personal-website-11fe3",
  storageBucket: "personal-website-11fe3.firebasestorage.app",
  messagingSenderId: "38202000791",
  appId: "1:38202000791:web:46b7ea6a23bad1adc030d2",
  measurementId: "G-3FEV0G6XRC"
};

// Initialize Firebase (v8 compat style)
firebase.initializeApp(firebaseConfig);

// Enable Firebase features
window.FIREBASE_ENABLED = true;

// Optional: Restrict admin access to specific emails
window.ALLOWED_ADMINS = [
  "kshitijsriv95@gmail.com",
  "kshitijs@iiitd.ac.in"
];
