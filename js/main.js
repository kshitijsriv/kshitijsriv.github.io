// Main JavaScript file for Kshitij Srivastava's personal website

// --- Mock Data ---
const mockBlogPosts = [
  {
    id: 1,
    title: "Lessons in Building an Open Transit Data Platform for Delhi",
    date: "2025-08-15",
    excerpt: "A comprehensive case study on developing India's first real-time Open Transit Data (OTD) platform for New Delhi buses...",
    markdownContent: `
### The Challenge
Building an Open Transit Data (OTD) platform in a city as complex as Delhi presents unique technical and administrative challenges. Our goal was to provide accurate, real-time transit information to millions of daily commuters.


### Our Approach
We focused on a robust framework for data collection, quality monitoring, and seamless integration with mobile applications. This involved:
-   Standardizing data from over 7,000 public transport buses.
-   Developing tools and dashboards for transit agencies to monitor data quality in real-time.
-   Collaborating with city authorities to ensure data accuracy and uptime.


### Impact
The OTD platform now powers hundreds of third-party applications, enhancing public transit use and providing invaluable data for urban planning. This project highlights the transformative impact of open data in developing countries. This work was published at TRB in Jan 2022.
    `
  },
  {
    id: 2,
    title: "Developing a Segmented Traffic Speed Algorithm",
    date: "2025-07-22",
    excerpt: "How we estimate bus speeds using historical trip data and real-time vehicle information to achieve an ETA accuracy of ±1 minute...",
    markdownContent: `
Accurate Estimated Time of Arrival (ETA) is critical for commuter satisfaction. We developed a novel segmented traffic speed algorithm to tackle this.


The solution operates by dividing routes into smaller road segments. It then uses the latest speed data from vehicles currently traversing a segment to estimate speeds for upcoming vehicles on that same segment.


This system is currently live in Delhi and Pune, covering over 8,500 buses. By integrating a Flask API with a SQL backend, we can handle massive volumes of real-time data ingestion and processing, delivering ETAs with an accuracy of ±1 minute.
    `
  },
  {
    id: 3,
    title: "Contactless E-ticketing in Public Transport Buses",
    date: "2025-06-10",
    excerpt: "Collaborating on a secure, touch-free e-ticketing system that has now scaled to over 100 million tickets sold in Delhi...",
    markdownContent: `
In response to the need for safer and more efficient payment methods, we collaborated on the development of a contactless e-ticketing system for public transport.


The system allows passengers to purchase tickets through a secure, touch-free mobile application. Initially trialed in September 2019, the system has seen massive adoption.


To date, it has successfully processed over 100 million contactless e-tickets, demonstrating a significant shift in consumer behavior and improving the efficiency of the city's transit operations. This work was published at COMSNETS in May 2021.
    `
  }
];

const mockPhotos = [
  { id: 1, src: "https://placehold.co/600x400/3498db/ffffff?text=IIITD+Campus", description: "The beautiful central plaza at IIIT Delhi." },
  { id: 2, src: "https://placehold.co/600x400/e74c3c/ffffff?text=Himalayan+Trek", description: "Sunrise view during a trek in the Himalayas." },
  { id: 3, src: "https://placehold.co/600x400/2ecc71/ffffff?text=Delhi+Metro", description: "The lifeline of the city, a subject of my research." },
  { id: 4, src: "https://placehold.co/600x400/f1c40f/ffffff?text=Conference+Talk", description: "Presenting my research at a transportation conference." },
  { id: 5, src: "https://placehold.co/600x400/9b59b6/ffffff?text=Jaipur+Street", description: "Vibrant colors of a street in Jaipur." },
  { id: 6, src: "https://placehold.co/600x400/1abc9c/ffffff?text=Research+Lab", description: "Late night coding sessions in the lab." },
  { id: 7, src: "https://placehold.co/600x400/d35400/ffffff?text=Goa+Sunset", description: "A serene sunset on the coast of Goa." },
  { id: 8, src: "https://placehold.co/600x400/34495e/ffffff?text=Old+Delhi", description: "The organized chaos of Chandni Chowk." },
];

// --- Firebase util ---
function isFirebaseReady() {
  try {
    return Boolean(window.FIREBASE_ENABLED && window.firebase && window.firebase.apps && window.firebase.apps.length);
  } catch (_) {
    return false;
  }
}

// Initialize the website when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  initMobileMenu();
  loadBlogPosts();
  loadPhotoGallery();
  initBlogNavigation();
  initPhotoModal();
});

// --- Dark Mode Toggle ---
function initDarkMode() {
  const darkModeToggle = document.getElementById('darkModeToggle');
  const sunIcon = document.getElementById('sunIcon');
  const moonIcon = document.getElementById('moonIcon');
  const html = document.documentElement;

  // This function applies the theme and saves the preference.
  const setTheme = (isDark) => {
    if (isDark) {
      html.classList.add('dark');
      if (sunIcon) sunIcon.classList.add('hidden');
      if (moonIcon) moonIcon.classList.remove('hidden');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      if (sunIcon) sunIcon.classList.remove('hidden');
      if (moonIcon) moonIcon.classList.add('hidden');
      localStorage.setItem('theme', 'light');
    }
  };

  // Check for saved theme in localStorage or system preference on page load.
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (savedTheme === null && prefersDark)) {
    setTheme(true);
  } else {
    setTheme(false);
  }

  // Add click event listener to the toggle button.
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
      const isCurrentlyDark = html.classList.contains('dark');
      setTheme(!isCurrentlyDark);
    });
  }
}

// --- Mobile Menu ---
function initMobileMenu() {
  const mobileMenuButton = document.getElementById('mobileMenuButton');
  const mobileMenu = document.getElementById('mobileMenu');
  
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }
}

// --- Dynamic Content Loading ---
async function loadBlogPosts() {
  const blogPostsContainer = document.getElementById('blog-posts');
  
  if (!blogPostsContainer) return;
  
  const converter = new showdown.Converter();
  let posts = [];

  if (isFirebaseReady()) {
    try {
      const db = firebase.firestore();
      const snapshot = await db.collection('posts').orderBy('date', 'desc').get();
      posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.warn('Failed to load posts from Firestore, using mock data.', e);
      posts = mockBlogPosts;
    }
  } else {
    posts = mockBlogPosts;
  }

  posts.forEach(post => {
    const postElement = document.createElement('div');
    postElement.className = 'bg-white dark:bg-[#1e1e1e] rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer';
    const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    postElement.innerHTML = `
      <p class="text-sm text-slate-500 dark:text-slate-400 mb-2">${formattedDate}</p>
      <h3 class="text-xl font-semibold mb-3">${post.title}</h3>
      <p class="text-slate-600 dark:text-slate-300 mb-4">${post.excerpt}</p>
      <span class="text-sky-500 hover:text-sky-600 font-medium">Read More →</span>
    `;
    
    postElement.addEventListener('click', () => {
      showBlogPost(post);
    });
    
    blogPostsContainer.appendChild(postElement);
  });
}

async function loadPhotoGallery() {
  const photoGalleryContainer = document.getElementById('photo-gallery');
  
  if (!photoGalleryContainer) return;
  let photos = [];

  if (isFirebaseReady()) {
    try {
      const db = firebase.firestore();
      const snapshot = await db.collection('photos').orderBy('createdAt', 'desc').get();
      photos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.warn('Failed to load photos from Firestore, using mock data.', e);
      photos = mockPhotos;
    }
  } else {
    photos = mockPhotos;
  }

  photos.forEach(photo => {
    const photoElement = document.createElement('div');
    photoElement.className = 'relative overflow-hidden rounded-lg group gallery-item cursor-pointer aspect-square';
    photoElement.innerHTML = `
      <img src="${photo.src}" alt="${photo.description}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onerror="this.onerror=null;this.src='https://placehold.co/600x400/e2e8f0/334155?text=Image+Not+Found';">
      <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-500 flex items-end p-4">
        <p class="text-white text-sm opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">${photo.description}</p>
      </div>
    `;
    
    photoElement.addEventListener('click', () => {
      openPhotoModal(photo.src, photo.description);
    });
    
    photoGalleryContainer.appendChild(photoElement);
  });
}

// --- Modal functionality ---
function initModal() {
  const closeModal = document.getElementById('closeModal');
  const blogModal = document.getElementById('blogModal');
  
  if (closeModal && blogModal) {
    closeModal.addEventListener('click', closeBlogModal);
    
    blogModal.addEventListener('click', (e) => {
      if (e.target === blogModal) {
        closeBlogModal();
      }
    });
  }
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && blogModal && !blogModal.classList.contains('hidden')) {
      closeBlogModal();
    }
  });
}

function openBlogModal(title, content) {
  const blogModal = document.getElementById('blogModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalContent = document.getElementById('modalContent');
  
  if (blogModal && modalTitle && modalContent) {
    modalTitle.textContent = title;
    modalContent.innerHTML = content;
    blogModal.classList.remove('hidden');
    blogModal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }
}

// --- Blog Navigation ---
function initBlogNavigation() {
  const backToBlog = document.getElementById('back-to-blog');
  
  backToBlog && backToBlog.addEventListener('click', () => {
    showBlogList();
  });
}

function showBlogList() {
  const blogListView = document.getElementById('blog-list-view');
  const blogPostView = document.getElementById('blog-post-view');
  
  if (blogListView && blogPostView) {
    blogListView.classList.remove('hidden');
    blogPostView.classList.add('hidden');
    
    // Smooth scroll to top if on blog page
    const blogSection = document.getElementById('blog');
    if (blogSection) {
      blogSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}

function showBlogPost(post) {
  const blogListView = document.getElementById('blog-list-view');
  const blogPostView = document.getElementById('blog-post-view');
  const postTitle = document.getElementById('post-title');
  const postDate = document.getElementById('post-date');
  const postContent = document.getElementById('post-content');
  
  if (blogListView && blogPostView && postTitle && postDate && postContent) {
    // Update post content
    postTitle.textContent = post.title;
    postDate.textContent = new Date(post.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Convert markdown to HTML
    const converter = new showdown.Converter();
    postContent.innerHTML = converter.makeHtml(post.markdownContent);
    
    // Switch views
    blogListView.classList.add('hidden');
    blogPostView.classList.remove('hidden');
    
    // Smooth scroll to top if on blog page
    const blogSection = document.getElementById('blog');
    if (blogSection) {
      blogSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}

// --- Photo Modal ---
function initPhotoModal() {
  const photoModal = document.getElementById('photoModal');
  const closePhotoModal = document.getElementById('closePhotoModal');
  
  if (closePhotoModal && photoModal) {
    closePhotoModal.addEventListener('click', closePhotoModalFunc);
    
    photoModal.addEventListener('click', (e) => {
      if (e.target === photoModal) {
        closePhotoModalFunc();
      }
    });
  }
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && photoModal && !photoModal.classList.contains('hidden')) {
      closePhotoModalFunc();
    }
  });
}

function openPhotoModal(src, description) {
  const photoModal = document.getElementById('photoModal');
  const modalImage = document.getElementById('modalImage');
  const modalDescription = document.getElementById('modalDescription');
  
  if (photoModal && modalImage && modalDescription) {
    modalImage.src = src;
    modalImage.alt = description;
    modalDescription.textContent = description;
    photoModal.classList.remove('hidden');
    photoModal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }
}

function closePhotoModalFunc() {
  const photoModal = document.getElementById('photoModal');
  
  if (photoModal) {
    photoModal.classList.add('hidden');
    photoModal.classList.remove('flex');
    document.body.style.overflow = 'auto';
  }
}
