// Funky animations and interactive effects for the personal website

// Floating shapes animation
function createFloatingShapes() {
    const container = document.getElementById('floatingShapes');
    if (!container) return;
    
    const shapes = [];
    const numShapes = 8;
    
    for (let i = 0; i < numShapes; i++) {
        const shape = document.createElement('div');
        shape.className = 'floating-shape';
        
        // Random size between 20px and 80px
        const size = Math.random() * 60 + 20;
        shape.style.width = `${size}px`;
        shape.style.height = `${size}px`;
        
        // Random position
        shape.style.left = `${Math.random() * 100}%`;
        shape.style.top = `${Math.random() * 100}%`;
        
        // Random animation delay
        shape.style.animationDelay = `${Math.random() * 6}s`;
        
        // Random opacity
        shape.style.opacity = Math.random() * 0.3 + 0.1;
        
        container.appendChild(shape);
        shapes.push(shape);
    }
    
    // Animate shapes continuously
    setInterval(() => {
        shapes.forEach(shape => {
            const newX = Math.random() * 100;
            const newY = Math.random() * 100;
            shape.style.transition = 'all 15s ease-in-out';
            shape.style.left = `${newX}%`;
            shape.style.top = `${newY}%`;
        });
    }, 15000);
}

// Parallax scroll effect
function initializeParallax() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const shapes = document.querySelectorAll('.floating-shape');
        
        shapes.forEach((shape, index) => {
            const speed = 0.3 + (index * 0.05);
            const yPos = -(scrolled * speed);
            const rotation = scrolled * 0.05;
            shape.style.transform = `translateY(${yPos}px) rotate(${rotation}deg)`;
        });
    });
}

// Intersection Observer for scroll animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe all animated elements
    document.querySelectorAll('.animate-slide-up').forEach(el => {
        el.style.animationPlayState = 'paused';
        observer.observe(el);
    });
}

// Cursor trail effect (only on desktop)
function initializeCursorTrail() {
    if (window.innerWidth < 768) return; // Skip on mobile
    
    const trail = [];
    const trailLength = 8;
    
    // Create trail elements
    for (let i = 0; i < trailLength; i++) {
        const dot = document.createElement('div');
        dot.className = 'cursor-trail';
        dot.style.cssText = `
            position: fixed;
            width: 6px;
            height: 6px;
            background: linear-gradient(45deg, #6366f1, #a855f7);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            opacity: ${(1 - (i / trailLength)) * 0.6};
            transition: all 0.1s ease;
            mix-blend-mode: screen;
        `;
        document.body.appendChild(dot);
        trail.push(dot);
    }
    
    // Update trail on mouse move
    document.addEventListener('mousemove', (e) => {
        trail.forEach((dot, index) => {
            setTimeout(() => {
                dot.style.left = `${e.clientX - 3}px`;
                dot.style.top = `${e.clientY - 3}px`;
            }, index * 30);
        });
    });
}

// Interactive button effects
function initializeButtonEffects() {
    const buttons = document.querySelectorAll('a[href], button');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', (e) => {
            const rect = e.target.getBoundingClientRect();
            const ripple = document.createElement('div');
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
                z-index: 1;
                left: ${e.clientX - rect.left}px;
                top: ${e.clientY - rect.top}px;
                width: 20px;
                height: 20px;
                margin-left: -10px;
                margin-top: -10px;
            `;
            
            e.target.style.position = 'relative';
            e.target.style.overflow = 'hidden';
            e.target.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Mouse move parallax for profile image
function initializeImageParallax() {
    const profileImage = document.querySelector('img[alt="Kshitij Srivastava"]');
    if (!profileImage) return;
    
    profileImage.addEventListener('mousemove', (e) => {
        const rect = profileImage.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / centerY * 10;
        const rotateY = (centerX - x) / centerX * 10;
        
        profileImage.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
    });
    
    profileImage.addEventListener('mouseleave', () => {
        profileImage.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    });
}

// Add CSS for ripple animation
function addRippleCSS() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        .animate-in {
            animation-play-state: running !important;
        }
        
        .cursor-trail {
            transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
        }
    `;
    document.head.appendChild(style);
}

// Initialize all funky animations
function initializeFunkyAnimations() {
    addRippleCSS();
    createFloatingShapes();
    initializeParallax();
    initializeScrollAnimations();
    initializeCursorTrail();
    initializeButtonEffects();
    initializeImageParallax();
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure other scripts have loaded
    setTimeout(initializeFunkyAnimations, 100);
});
