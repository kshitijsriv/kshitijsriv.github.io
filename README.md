# Personal Website - Kshitij Srivastava

This is a clean, minimal personal website for Kshitij Srivastava, showcasing his work as a Data Engineer and PhD student at IIIT Delhi.

## Features

- Responsive design with mobile support
- Dark/light mode toggle with system preference detection
- Blog section with modal-based article viewing
- Photo gallery with hover effects
- SEO optimized with meta tags
- Clean, minimal aesthetic with smooth animations

## Structure

```bash
├── index.html                 # Main site (Tailwind CDN, dark mode pre-init)
├── admin.html                 # Admin dashboard (Firebase Auth + Firestore CRUD)
├── cv_kshitij_srivastava.pdf  # CV document
├── .nojekyll                  # Ensures GitHub Pages serves as-is
├── css/
│   └── styles.css             # Custom CSS styles
├── js/
│   ├── main.js                # Site logic (Firestore loading with mock fallback)
│   ├── admin.js               # Admin dashboard logic
│   ├── firebase-config.sample.js # Template Firebase config
│   └── firebase-config.js     # Your Firebase config (by default disabled)
├── server.js                  # Local dev static server (Node)
├── package.json               # Project scripts (npm start)
└── README.md                  # This file
```

## How to Use

1. Open `index.html` in a web browser to view the website
2. Toggle dark/light mode using the icon in the top right corner
3. Navigate using the menu or by scrolling
4. Click on blog posts to read full articles in a modal
5. Hover over gallery images to see descriptions
6. Admin: open `admin.html` (requires Firebase setup below)

## Customization

To update content:

- Modify the `mockBlogPosts` and `mockPhotos` arrays in `js/main.js`
- Replace placeholder images with actual images
- Update the CV by replacing `cv_kshitij_srivastava.pdf`

## Technologies Used

- HTML5
- Tailwind CSS (via CDN)
- JavaScript (ES6+)
- Showdown.js for Markdown rendering
- Firebase (optional): Auth + Firestore

## Local Development

Run a simple static server for local testing:

```bash
npm start
# or
node server.js
```

Visit <http://localhost:3000>

## Deployment (GitHub Pages)

Project Pages deployment:

1. Commit and push this project to a GitHub repository
2. In GitHub → Settings → Pages:
   - Source: Deploy from a branch
   - Branch: `main` (or default), Folder: `/root`
3. Save. GitHub Pages will publish your site at `https://<username>.github.io/<repo>`

Notes:

- `.nojekyll` is included so files are served without Jekyll processing
- `server.js` is only for local dev; GitHub Pages will serve static files from the repo
- For a custom domain, add it in Pages settings and create a DNS CNAME

## Firebase Setup (Admin + Live Content)

Optional: Enable the admin dashboard and load content from Firestore instead of mock data.

1. Create a Firebase project at <https://console.firebase.google.com/>
1. Enable Authentication → Sign-in method → Google
1. Enable Firestore Database
1. Copy `js/firebase-config.sample.js` → `js/firebase-config.js` and fill your config, then set:

```js
firebase.initializeApp(firebaseConfig);
window.FIREBASE_ENABLED = true;
// Optional: restrict admin access to specific emails
window.ALLOWED_ADMINS = ["you@example.com"];
```

1. Security rules (example): allow reads publicly but restrict writes to your admin emails

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null && request.auth.token.email in [
        "you@example.com"
      ];
    }

    match /posts/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /photos/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

1. Content model:

- `posts` documents: `{ title, date (YYYY-MM-DD), excerpt, markdownContent, createdAt }`
- `photos` documents: `{ src, description, createdAt }`

1. Use `admin.html` to add/edit content. The public site (`index.html`) will attempt to load from Firestore; if Firebase is disabled or fails, it falls back to mock content in `js/main.js`.
