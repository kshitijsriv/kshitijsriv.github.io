// Admin dashboard logic for Firebase Auth + Firestore CRUD + Storage

// --- Image Compression Utility ---
function compressImage(file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
}

function show(el) { el && el.classList.remove('hidden'); }
function hide(el) { el && el.classList.add('hidden'); }

function isFirebaseEnabled() {
  try {
    return Boolean(window.FIREBASE_ENABLED && window.firebase && firebase.apps && firebase.apps.length);
  } catch (_) {
    return false;
  }
}

function isAllowedEmail(email) {
  try {
    if (Array.isArray(window.ALLOWED_ADMINS) && window.ALLOWED_ADMINS.length > 0) {
      return window.ALLOWED_ADMINS.includes(email);
    }
    return true; // if no list provided, allow any signed-in user
  } catch (_) {
    return true;
  }
}

// --- Firestore helpers ---
async function loadPosts() {
  const list = document.getElementById('postsList');
  if (!list) return;
  list.innerHTML = '';
  const db = firebase.firestore();
  try {
    let ref = db.collection('posts');
    try { ref = ref.orderBy('date', 'desc'); } catch (_) {}
    const snapshot = await ref.get();
    snapshot.forEach((doc) => {
      const p = doc.data();
      const li = document.createElement('li');
      li.className = 'flex items-center justify-between p-3 rounded border border-slate-200 dark:border-slate-700';
      li.innerHTML = `
        <div>
          <div class="font-medium">${p.title || '(untitled)'} <span class="text-xs text-slate-500">${p.date || ''}</span></div>
          <div class="text-xs text-slate-500">${p.excerpt || ''}</div>
        </div>
        <div class="flex items-center gap-2">
          <button data-id="${doc.id}" class="delete-post px-2 py-1 text-xs rounded bg-red-500 text-white hover:bg-red-600">Delete</button>
        </div>
      `;
      list.appendChild(li);
    });
  } catch (e) {
    console.error('Failed to load posts', e);
    list.innerHTML = '<li class="text-sm text-red-500">Failed to load posts</li>';
  }
}

async function loadPhotos() {
  const list = document.getElementById('photosList');
  if (!list) return;
  list.innerHTML = '';
  const db = firebase.firestore();
  try {
    let ref = db.collection('photos');
    try { ref = ref.orderBy('createdAt', 'desc'); } catch (_) {}
    const snapshot = await ref.get();
    snapshot.forEach((doc) => {
      const p = doc.data();
      const li = document.createElement('li');
      li.className = 'flex items-center justify-between p-3 rounded border border-slate-200 dark:border-slate-700';
      li.innerHTML = `
        <div>
          <div class="font-medium truncate max-w-xs">${p.description || '(no description)'}</div>
          <div class="text-xs text-slate-500 truncate max-w-xs">${p.src || ''}</div>
        </div>
        <div class="flex items-center gap-2">
          <button data-id="${doc.id}" class="delete-photo px-2 py-1 text-xs rounded bg-red-500 text-white hover:bg-red-600">Delete</button>
        </div>
      `;
      list.appendChild(li);
    });
  } catch (e) {
    console.error('Failed to load photos', e);
    list.innerHTML = '<li class="text-sm text-red-500">Failed to load photos</li>';
  }
}

function bindDeleteHandlers() {
  const postsList = document.getElementById('postsList');
  const photosList = document.getElementById('photosList');
  const db = firebase.firestore();

  postsList && postsList.addEventListener('click', async (e) => {
    const target = e.target;
    if (target && target.classList.contains('delete-post')) {
      const id = target.getAttribute('data-id');
      if (confirm('Delete this post?')) {
        await db.collection('posts').doc(id).delete();
        await loadPosts();
      }
    }
  });

  photosList && photosList.addEventListener('click', async (e) => {
    const target = e.target;
    if (target && target.classList.contains('delete-photo')) {
      const id = target.getAttribute('data-id');
      if (confirm('Delete this photo?')) {
        await db.collection('photos').doc(id).delete();
        await loadPhotos();
      }
    }
  });
}

function bindForms() {
  const postForm = document.getElementById('postForm');
  const photoUrlForm = document.getElementById('photoUrlForm');
  const photoUploadForm = document.getElementById('photoUploadForm');

  postForm && postForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const db = firebase.firestore();
    const title = document.getElementById('postTitle').value.trim();
    const date = document.getElementById('postDate').value;
    const excerpt = document.getElementById('postExcerpt').value.trim();
    const markdownContent = document.getElementById('postMarkdown').value.trim();
    if (!title || !date || !excerpt || !markdownContent) return;
    await db.collection('posts').add({ title, date, excerpt, markdownContent, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    e.target.reset();
    await loadPosts();
  });

  // URL-based photo form
  photoUrlForm && photoUrlForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const db = firebase.firestore();
    const src = document.getElementById('photoSrc').value.trim();
    const description = document.getElementById('urlDescription').value.trim();
    if (!src || !description) return;
    await db.collection('photos').add({ src, description, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    e.target.reset();
    await loadPhotos();
  });

  // File upload form
  photoUploadForm && photoUploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleImageUpload();
  });
}

function initAuthUI() {
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const adminPanels = document.getElementById('adminPanels');
  const firebaseDisabled = document.getElementById('firebaseDisabled');
  const notAllowed = document.getElementById('notAllowed');

  if (!isFirebaseEnabled()) {
    show(firebaseDisabled);
    hide(adminPanels);
    hide(logoutBtn);
    show(loginBtn);
    return;
  }

  const auth = firebase.auth();
  const provider = new firebase.auth.GoogleAuthProvider();

  loginBtn && loginBtn.addEventListener('click', () => {
    // Use redirect for localhost compatibility
    if (window.location.hostname === 'localhost') {
      auth.signInWithRedirect(provider);
    } else {
      auth.signInWithPopup(provider);
    }
  });
  logoutBtn && logoutBtn.addEventListener('click', () => auth.signOut());

  // Handle redirect result
  auth.getRedirectResult().catch((error) => {
    console.error('Redirect sign-in error:', error);
  });

  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      hide(adminPanels);
      hide(logoutBtn);
      show(loginBtn);
      hide(notAllowed);
      return;
    }

    const allowed = isAllowedEmail(user.email);
    
    if (!allowed) {
      show(notAllowed);
      hide(adminPanels);
      show(logoutBtn);
      hide(loginBtn);
      return;
    }

    hide(notAllowed);
    show(adminPanels);
    hide(loginBtn);
    show(logoutBtn);

    await loadPosts();
    await loadPhotos();
    bindDeleteHandlers();
    bindForms();
  });
}

// --- Image Upload Functionality ---
async function handleImageUpload() {
  const fileInput = document.getElementById('photoFile');
  const description = document.getElementById('uploadDescription').value.trim();
  const uploadBtn = document.getElementById('uploadBtn');
  const uploadBtnText = document.getElementById('uploadBtnText');
  const uploadSpinner = document.getElementById('uploadSpinner');
  
  if (!fileInput.files[0] || !description) return;
  
  try {
    // Show loading state
    uploadBtn.disabled = true;
    uploadBtnText.textContent = 'Uploading...';
    uploadSpinner.classList.remove('hidden');
    
    const file = fileInput.files[0];
    
    // Compress image
    const compressedFile = await compressImage(file);
    
    // Upload to ImgBB (free image hosting)
    const downloadURL = await uploadToImgBB(compressedFile);
    
    // Save to Firestore
    const db = firebase.firestore();
    await db.collection('photos').add({
      src: downloadURL,
      description: description,
      originalName: file.name,
      uploadedAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Reset form
    clearUploadForm();
    await loadPhotos();
    
    alert('Image uploaded successfully!');
    
  } catch (error) {
    console.error('Upload error:', error);
    alert('Upload failed: ' + error.message);
  } finally {
    // Reset button state
    uploadBtn.disabled = false;
    uploadBtnText.textContent = 'Upload Image';
    uploadSpinner.classList.add('hidden');
  }
}

// --- Secure Image Upload Function ---
async function uploadToImgBB(file) {
  // Try free image hosting services that don't require API keys
  const formData = new FormData();
  formData.append('file', file);
  
  // Option 1: Use 0x0.st (no API key required)
  try {
    const response = await fetch('https://0x0.st', {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      const url = await response.text();
      if (url && url.trim().startsWith('https://0x0.st/')) {
        return url.trim();
      }
    }
  } catch (e) {
    console.warn('0x0.st failed, trying alternative...');
  }
  
  // Option 2: Use catbox.moe (no API key required)
  try {
    const catboxFormData = new FormData();
    catboxFormData.append('reqtype', 'fileupload');
    catboxFormData.append('fileToUpload', file);
    
    const response = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: catboxFormData
    });
    
    if (response.ok) {
      const url = await response.text();
      if (url && url.trim().startsWith('https://files.catbox.moe/')) {
        return url.trim();
      }
    }
  } catch (e) {
    console.warn('catbox.moe failed, trying alternative...');
  }
  
  // Option 3: Use pomf.lain.la (no API key required)
  try {
    const pomfFormData = new FormData();
    pomfFormData.append('files[]', file);
    
    const response = await fetch('https://pomf.lain.la/upload.php', {
      method: 'POST',
      body: pomfFormData
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.files && result.files[0]) {
        return result.files[0].url;
      }
    }
  } catch (e) {
    console.warn('pomf.lain.la failed');
  }
  
  // Final fallback: Create a data URL (works locally but not for sharing)
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

function initUploadUI() {
  const photoFile = document.getElementById('photoFile');
  const dropZone = document.getElementById('dropZone');
  const filePreview = document.getElementById('filePreview');
  const previewImage = document.getElementById('previewImage');
  const fileName = document.getElementById('fileName');
  const uploadBtn = document.getElementById('uploadBtn');
  const uploadBtnText = document.getElementById('uploadBtnText');
  const clearUpload = document.getElementById('clearUpload');
  const uploadToggle = document.getElementById('uploadToggle');
  const urlToggle = document.getElementById('urlToggle');
  const photoUploadForm = document.getElementById('photoUploadForm');
  const photoUrlForm = document.getElementById('photoUrlForm');
  
  // Toggle between upload methods
  uploadToggle && uploadToggle.addEventListener('click', () => {
    uploadToggle.classList.add('bg-indigo-600', 'text-white');
    uploadToggle.classList.remove('text-slate-600', 'dark:text-slate-400');
    urlToggle.classList.remove('bg-indigo-600', 'text-white');
    urlToggle.classList.add('text-slate-600', 'dark:text-slate-400');
    photoUploadForm.classList.remove('hidden');
    photoUrlForm.classList.add('hidden');
  });
  
  urlToggle && urlToggle.addEventListener('click', () => {
    urlToggle.classList.add('bg-indigo-600', 'text-white');
    urlToggle.classList.remove('text-slate-600', 'dark:text-slate-400');
    uploadToggle.classList.remove('bg-indigo-600', 'text-white');
    uploadToggle.classList.add('text-slate-600', 'dark:text-slate-400');
    photoUrlForm.classList.remove('hidden');
    photoUploadForm.classList.add('hidden');
  });
  
  // File input handling
  dropZone && dropZone.addEventListener('click', () => photoFile.click());
  
  // Drag and drop
  dropZone && dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('border-indigo-400', 'dark:border-indigo-500');
  });
  
  dropZone && dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('border-indigo-400', 'dark:border-indigo-500');
  });
  
  dropZone && dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-indigo-400', 'dark:border-indigo-500');
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      photoFile.files = files;
      handleFileSelect(files[0]);
    }
  });
  
  photoFile && photoFile.addEventListener('change', (e) => {
    if (e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  });
  
  clearUpload && clearUpload.addEventListener('click', clearUploadForm);
  
  function handleFileSelect(file) {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size must be less than 10MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.src = e.target.result;
      fileName.textContent = file.name;
      filePreview.classList.remove('hidden');
      clearUpload.classList.remove('hidden');
      uploadBtn.disabled = false;
      uploadBtnText.textContent = 'Upload Image';
    };
    reader.readAsDataURL(file);
  }
}

function clearUploadForm() {
  const photoFile = document.getElementById('photoFile');
  const filePreview = document.getElementById('filePreview');
  const uploadBtn = document.getElementById('uploadBtn');
  const uploadBtnText = document.getElementById('uploadBtnText');
  const clearUpload = document.getElementById('clearUpload');
  const uploadDescription = document.getElementById('uploadDescription');
  
  photoFile.value = '';
  uploadDescription.value = '';
  filePreview.classList.add('hidden');
  clearUpload.classList.add('hidden');
  uploadBtn.disabled = true;
  uploadBtnText.textContent = 'Select Image First';
}

// --- Publications Management ---
async function loadPublications() {
    try {
        const db = firebase.firestore();
        const snapshot = await db.collection('publications')
            .orderBy('year', 'desc')
            .orderBy('createdAt', 'desc')
            .get();

        const publicationsList = document.getElementById('publicationsList');
        if (!publicationsList) return;
        
        publicationsList.innerHTML = '';

        snapshot.forEach(doc => {
            const pub = doc.data();
            const li = document.createElement('li');
            li.className = 'flex justify-between items-start p-3 bg-slate-50 dark:bg-slate-800 rounded-md';
            li.innerHTML = `
                <div class="flex-1">
                    <div class="font-medium">${pub.title}</div>
                    <div class="text-slate-600 dark:text-slate-400 text-sm">${pub.authors}</div>
                    <div class="text-indigo-600 dark:text-indigo-400 text-sm">${pub.venue} (${pub.year})</div>
                </div>
                <button onclick="deletePublication('${doc.id}')" class="text-red-600 hover:text-red-800 text-sm">Delete</button>
            `;
            publicationsList.appendChild(li);
        });
    } catch (error) {
        console.error('Error loading publications:', error);
    }
}

async function addPublication(event) {
    event.preventDefault();
    
    const title = document.getElementById('pubTitle').value.trim();
    const authors = document.getElementById('pubAuthors').value.trim();
    const venue = document.getElementById('pubVenue').value.trim();
    const year = parseInt(document.getElementById('pubYear').value);
    const abstract = document.getElementById('pubAbstract').value.trim();
    const pdfUrl = document.getElementById('pubPdfUrl').value.trim();
    const doiUrl = document.getElementById('pubDoiUrl').value.trim();
    const codeUrl = document.getElementById('pubCodeUrl').value.trim();

    if (!title || !authors || !venue || !year) {
        alert('Please fill in all required fields');
        return;
    }

    try {
        const db = firebase.firestore();
        const publicationData = {
            title,
            authors,
            venue,
            year,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Add optional fields if provided
        if (abstract) publicationData.abstract = abstract;
        if (pdfUrl) publicationData.pdfUrl = pdfUrl;
        if (doiUrl) publicationData.doiUrl = doiUrl;
        if (codeUrl) publicationData.codeUrl = codeUrl;

        await db.collection('publications').add(publicationData);
        
        // Reset form
        document.getElementById('publicationForm').reset();
        
        // Reload publications
        await loadPublications();
        
        alert('Publication added successfully!');
    } catch (error) {
        console.error('Error adding publication:', error);
        alert('Error adding publication: ' + error.message);
    }
}

async function deletePublication(publicationId) {
    if (!confirm('Are you sure you want to delete this publication?')) {
        return;
    }

    try {
        const db = firebase.firestore();
        await db.collection('publications').doc(publicationId).delete();
        await loadPublications();
        alert('Publication deleted successfully!');
    } catch (error) {
        console.error('Error deleting publication:', error);
        alert('Error deleting publication: ' + error.message);
    }
}

// Init
window.addEventListener('DOMContentLoaded', () => {
  // Dark mode is handled by components.js
  initAuthUI();
  initUploadUI();
  
  // Initialize publications form
  const publicationForm = document.getElementById('publicationForm');
  if (publicationForm) {
    publicationForm.addEventListener('submit', addPublication);
    loadPublications();
  }
});
