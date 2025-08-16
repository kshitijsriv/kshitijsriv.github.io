# Firebase Setup Guide

## Security Considerations

**Firebase config is SAFE to expose publicly** - it contains only public identifiers, not secrets:
- `apiKey`: Public browser API key (not a secret)
- `authDomain`, `projectId`: Public identifiers
- `storageBucket`, `messagingSenderId`, `appId`: Public identifiers

**Real security comes from Firestore rules**, not hiding config.

## Step-by-Step Setup

### 1. Create Firebase Project

1. Go to <https://console.firebase.google.com/>
2. Click "Create a project"
3. Enter project name (e.g., "kshitij-website")
4. Disable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Authentication

1. In Firebase Console → Authentication
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Click "Google" → Enable → Save
5. Set authorized domains: 
   - Add `localhost` for local development
   - Add your GitHub Pages domain when you deploy

### 3. Enable Firestore Database

1. In Firebase Console → Firestore Database
2. Click "Create database"
3. Start in **test mode** (we'll secure it later)
4. Choose location (closest to your users)

### 4. Get Firebase Config

1. In Firebase Console → Project Settings (gear icon)
2. Scroll to "Your apps" → Web apps
3. Click "Add app" (</> icon)
4. Enter app name → Register app
5. Copy the config object

### 5. Configure Your Website

1. Copy `js/firebase-config.sample.js` to `js/firebase-config.js`
2. Replace the content with:

```js
// Your Firebase config from step 4
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Enable Firebase features
window.FIREBASE_ENABLED = true;

// Optional: Restrict admin access to specific emails
window.ALLOWED_ADMINS = [
  "your-email@gmail.com",
  "another-admin@example.com"
];
```

### 6. Secure Firestore Rules

In Firebase Console → Firestore Database → Rules, replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
             request.auth.token.email in [
               "your-email@gmail.com",
               "another-admin@example.com"
             ];
    }

    // Posts collection
    match /posts/{docId} {
      allow read: if true;  // Anyone can read
      allow write: if isAdmin();  // Only admins can write
    }

    // Photos collection
    match /photos/{docId} {
      allow read: if true;  // Anyone can read
      allow write: if isAdmin();  // Only admins can write
    }
  }
}
```

### 7. Test Admin Access

1. Open `admin.html` in your browser
2. Click "Sign in" → Sign in with Google
3. If your email is in `ALLOWED_ADMINS`, you'll see the admin panels
4. Add a test post or photo to verify Firestore write access

## Content Structure

### Posts Collection
Each document should have:
```js
{
  title: "Post Title",
  date: "2025-01-15",  // YYYY-MM-DD format
  excerpt: "Brief description...",
  markdownContent: "# Full post content in markdown...",
  createdAt: firebase.firestore.FieldValue.serverTimestamp()
}
```

### Photos Collection
Each document should have:
```js
{
  src: "https://example.com/image.jpg",
  description: "Photo description",
  createdAt: firebase.firestore.FieldValue.serverTimestamp()
}
```

## Troubleshooting

**Admin page shows "Firebase is not configured"**
- Check `js/firebase-config.js` exists and has `window.FIREBASE_ENABLED = true`

**"You are signed in but not authorized"**
- Add your email to `window.ALLOWED_ADMINS` array in `js/firebase-config.js`

**Firestore permission denied**
- Update Firestore rules with your actual email addresses
- Make sure you're signed in with an admin email

**Content not loading on main site**
- Check browser console for errors
- Verify Firestore rules allow public reads
- Content will fall back to mock data if Firebase fails

## Security Best Practices

1. **Never put secrets in frontend code** - Firebase config is safe to expose
2. **Use Firestore rules** - This is where real security happens
3. **Restrict admin emails** - Only add trusted email addresses
4. **Monitor usage** - Check Firebase Console for unusual activity
5. **Regular backups** - Export Firestore data periodically

## Cost Considerations

Firebase free tier includes:
- 50,000 reads/day
- 20,000 writes/day  
- 1GB storage
- 10GB bandwidth/month

For a personal website, this is typically sufficient.
