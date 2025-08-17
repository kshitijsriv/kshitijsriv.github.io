// Modular Header and Footer Components

// Generate consistent header HTML
function generateHeader(activePage = '') {
    return `
    <header id="header" class="sticky top-0 z-50 py-4 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-500">
        <div class="container mx-auto px-6 flex justify-between items-center">
            <a href="index.html" class="text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 bg-clip-text text-transparent">Kshitij Srivastava</a>
            <nav class="hidden md:flex items-center space-x-6">
                <a href="index.html" class="${activePage === 'home' ? 'text-sky-500 font-medium' : 'hover:text-sky-500 transition-colors'}">Home</a>
                <a href="blog.html" class="${activePage === 'blog' ? 'text-sky-500 font-medium' : 'hover:text-sky-500 transition-colors'}">Blog</a>
                <a href="gallery.html" class="${activePage === 'gallery' ? 'text-sky-500 font-medium' : 'hover:text-sky-500 transition-colors'}">Gallery</a>
                <a href="publications.html" class="${activePage === 'publications' ? 'text-sky-500 font-medium' : 'hover:text-sky-500 transition-colors'}">Publications</a>
                <a href="cv_kshitij_srivastava.pdf" class="hover:text-sky-500 transition-colors" target="_blank">CV</a>
            </nav>
            <div class="md:hidden">
                <button id="mobileMenuButton" class="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
            </div>
        </div>
        <!-- Mobile Menu -->
        <div id="mobileMenu" class="md:hidden hidden bg-white dark:bg-[#121212] border-t border-slate-200 dark:border-slate-800">
            <div class="px-6 py-4 space-y-3">
                <a href="index.html" class="block ${activePage === 'home' ? 'text-sky-500 font-medium' : 'text-slate-600 dark:text-slate-400 hover:text-sky-500'}">Home</a>
                <a href="blog.html" class="block ${activePage === 'blog' ? 'text-sky-500 font-medium' : 'text-slate-600 dark:text-slate-400 hover:text-sky-500'}">Blog</a>
                <a href="gallery.html" class="block ${activePage === 'gallery' ? 'text-sky-500 font-medium' : 'text-slate-600 dark:text-slate-400 hover:text-sky-500'}">Gallery</a>
                <a href="publications.html" class="block ${activePage === 'publications' ? 'text-sky-500 font-medium' : 'text-slate-600 dark:text-slate-400 hover:text-sky-500'}">Publications</a>
                <a href="cv_kshitij_srivastava.pdf" class="block text-slate-600 dark:text-slate-400 hover:text-sky-500" target="_blank">CV</a>
            </div>
        </div>
    </header>
    `;
}

// Generate consistent footer HTML with auto-updating year
function generateFooter() {
    const currentYear = new Date().getFullYear();
    return `
    <footer class="py-8 bg-transparent">
        <div class="container mx-auto px-6 text-center">
            <p class="text-slate-600 dark:text-slate-400">&copy; ${currentYear} Kshitij Srivastava. All rights reserved.</p>
        </div>
    </footer>
    `;
}

// Initialize header and footer on page load
function initializeComponents(activePage = '') {
    // Insert header
    const headerContainer = document.getElementById('headerContainer');
    if (headerContainer) {
        headerContainer.innerHTML = generateHeader(activePage);
        // Initialize mobile menu functionality AFTER header is inserted
        const mobileMenuButton = document.getElementById('mobileMenuButton');
        const mobileMenu = document.getElementById('mobileMenu');
        
        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', function() {
                mobileMenu.classList.toggle('hidden');
            });
        }
    }
    
    // Insert footer
    const footerContainer = document.getElementById('footerContainer');
    if (footerContainer) {
        footerContainer.innerHTML = generateFooter();
    }
}

// Auto-detect active page from URL
function getActivePageFromURL() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';
    
    if (filename === 'index.html' || filename === '') return 'home';
    if (filename === 'blog.html') return 'blog';
    if (filename === 'gallery.html') return 'gallery';
    if (filename === 'publications.html') return 'publications';
    return '';
}

// Initialize components when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const activePage = getActivePageFromURL();
    initializeComponents(activePage);
});
