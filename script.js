// 3D Background Configuration
const config = {
    PARTICLE_COUNT: 5000,
    PARTICLE_SIZE: 0.01,
    COLOR: '#6366f1',
    CAMERA_Z: 5,
    FOV: 75,
    NEAR_PLANE: 0.1,
    FAR_PLANE: 1000
};

// Initialize Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    config.FOV,
    window.innerWidth / window.innerHeight,
    config.NEAR_PLANE,
    config.FAR_PLANE
);

// Initialize Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: document.createElement('canvas'),
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
});

// Add canvas to DOM with optimized positioning
const canvasContainer = document.createElement('div');
canvasContainer.className = 'canvas-container';
canvasContainer.appendChild(renderer.domElement);
document.body.insertBefore(canvasContainer, document.body.firstChild);

// Set up renderer with performance optimizations
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Initialize Stats.js after DOM is ready
let stats;

function initStats() {
    try {
        stats = new Stats();
        stats.showPanel(0);
        document.body.appendChild(stats.dom);
        return true;
    } catch (error) {
        console.warn('Stats.js initialization failed:', error);
        return false;
    }
}

// Memory Management
function dispose() {
    if (stats) stats.dom.remove();
    scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) object.material.dispose();
    });
    renderer.dispose();
}

// Initialize Stats.js after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initStats();
});

// Handle window resize with debouncing
let resizeTimeout;
const handleResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }, 250);
};

window.addEventListener('resize', handleResize);

// Create particles
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 5000;
const posArray = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 100;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.01,
    color: '#6366f1',
    transparent: true,
    blending: THREE.AdditiveBlending
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

camera.position.z = 5;

// Add ambient light
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Add point light
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(0, 0, 10);
scene.add(pointLight);

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Update particle positions
    const time = Date.now() * 0.0005;
    const positions = particlesGeometry.attributes.position.array;
    
    for (let i = 0; i < particlesCount * 3; i += 3) {
        positions[i] = Math.sin(time + positions[i + 1]) * 20;
        positions[i + 1] = Math.cos(time + positions[i]) * 20;
        positions[i + 2] = Math.sin(time + positions[i + 2]) * 20;
    }
    
    particlesGeometry.attributes.position.needsUpdate = true;
    
    renderer.render(scene, camera);
}

animate();

// Loading Screen with Animation
const loadingScreen = document.getElementById('loading-screen');
const mainContent = document.getElementById('main-content');

// Animation for loading screen
const loadingAnimation = () => {
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        loadingScreen.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
};

// Animation for main content
const contentAnimation = () => {
    if (mainContent) {
        mainContent.style.opacity = '1';
        mainContent.style.transform = 'translateY(0)';
        mainContent.classList.remove('hidden');
    }
};

// Handle loading screen
window.addEventListener('load', () => {
    loadingAnimation();
    setTimeout(contentAnimation, 500);
});

// Fallback if load event doesn't fire
setTimeout(() => {
    if (document.readyState === 'complete') {
        loadingAnimation();
        setTimeout(contentAnimation, 500);
    }
}, 2000);

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Typing Animation for Hero Text
const typingAnimation = {
    element: document.getElementById('typing-text'),
    texts: [
        'Full Stack Developer',
        'Problem Solver',
        'Tech Enthusiast',
        'Innovator'
    ],
    textIndex: 0,
    charIndex: 0,
    currentText: '',
    colors: ['#6366f1', '#4f46e5', '#3b32e3', '#2d2bcb'],
    
    typeText: function() {
        if (this.charIndex < this.texts[this.textIndex].length) {
            this.currentText += this.texts[this.textIndex].charAt(this.charIndex);
            this.element.textContent = this.currentText;
            this.charIndex++;
            this.element.style.color = this.colors[this.textIndex];
            setTimeout(() => this.typeText(), 100);
        } else {
            setTimeout(() => this.eraseText(), 2000);
        }
    },
    
    eraseText: function() {
        if (this.charIndex > 0) {
            this.currentText = this.currentText.slice(0, -1);
            this.element.textContent = this.currentText;
            this.charIndex--;
            setTimeout(() => this.eraseText(), 50);
        } else {
            this.textIndex = (this.textIndex + 1) % this.texts.length;
            setTimeout(() => this.typeText(), 500);
        }
    }
};

// Start typing animation when content is visible
document.addEventListener('DOMContentLoaded', () => {
    typingAnimation.typeText();
});

// Intersection Observer for Reveal Animations
const revealOnScroll = () => {
    const elements = document.querySelectorAll('.reveal');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-slide');
                setTimeout(() => {
                    entry.target.classList.add('animate-fade');
                }, 100);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    elements.forEach(element => {
        observer.observe(element);
    });
};

// Initialize reveal animations
document.addEventListener('DOMContentLoaded', revealOnScroll);

// Cursor Animation
const cursor = document.querySelector('.cursor');

if (cursor) {
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
}

// Skills Animation
const skillsContainer = document.querySelector('.skills-container');

if (skillsContainer) {
    let isAnimating = false;
    
    const animateSkills = () => {
        if (isAnimating) return;
        
        const skillCards = skillsContainer.querySelectorAll('.skill-card');
        skillCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('animate-scale');
            }, index * 100);
        });
        
        isAnimating = true;
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateSkills();
            }
        });
    }, { threshold: 0.2 });

    observer.observe(skillsContainer);
}

// Project Cards Animation
const projectsContainer = document.querySelector('.projects-grid');

if (projectsContainer) {
    const projectCards = projectsContainer.querySelectorAll('.project-card');
    
    projectCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
        card.classList.add('animate-scale');
    });

    // Add shimmer effect on hover
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.classList.add('animate-shimmer');
        });
        
        card.addEventListener('mouseleave', () => {
            card.classList.remove('animate-shimmer');
        });
    });
}

// Loading Screen Animation
const loadingScreenAnimation = {
    init: function() {
        this.loadingScreen = document.getElementById('loading-screen');
        this.mainContent = document.getElementById('main-content');
        
        // Handle loading screen
        document.addEventListener('load', () => {
            this.hide();
        });

        // Fallback if load event doesn't fire
        setTimeout(() => {
            if (document.readyState === 'complete') {
                this.hide();
            }
        }, 2000);
    },

    hide: function() {
        if (this.loadingScreen) {
            this.loadingScreen.style.opacity = '0';
            this.loadingScreen.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                this.loadingScreen.style.display = 'none';
            }, 500);
        }

        if (this.mainContent) {
            this.mainContent.style.opacity = '1';
            this.mainContent.style.transform = 'translateY(0)';
            this.mainContent.classList.remove('hidden');
        }
    }
};

// Initialize loading screen animation
loadingScreenAnimation.init();

// Parallax Effect for Background
const parallaxElements = document.querySelectorAll('.parallax');

if (parallaxElements) {
    window.addEventListener('scroll', () => {
        parallaxElements.forEach(element => {
            const scrolled = window.pageYOffset;
            const rate = element.dataset.rate || 0.5;
            element.style.transform = `translateY(${scrolled * rate}px)`;
        });
    });
}

// Intersection Observer for Reveal Animations
const revealOnScroll = () => {
    const elements = document.querySelectorAll('.reveal');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    elements.forEach(element => {
        observer.observe(element);
    });
};

// Initialize reveal animations
document.addEventListener('DOMContentLoaded', revealOnScroll);

// Fallback if load event doesn't fire
setTimeout(() => {
    // Hide loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }

    // Show main content
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        mainContent.style.opacity = '1';
        mainContent.classList.remove('hidden');
    }
}, 2000);

// Typing Animation with Improved Text
const typingText = document.getElementById('typing-text');
typingText.textContent = 'I build things for the web';

// Smooth Scroll for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Mobile Menu Toggle
const mobileMenu = document.querySelector('.mobile-menu');
const navLinks = document.querySelector('.nav-links');
mobileMenu.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileMenu.classList.toggle('active');
});

// Scroll to Top Button
const scrollTopBtn = document.getElementById('scrollTopBtn');
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollTopBtn.style.display = 'block';
    } else {
        scrollTopBtn.style.display = 'none';
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Section Animations
const sections = document.querySelectorAll('.section');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show-section');
        }
    });
}, {
    threshold: 0.2
});

sections.forEach(section => observer.observe(section));

// Skills Progress Bars
const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const progress = entry.target.querySelector('.progress');
            const value = progress.getAttribute('data-progress');
            progress.style.width = value + '%';
        }
    });
}, { threshold: 0.3 });

document.querySelectorAll('.skill-card').forEach(skill => {
    skillObserver.observe(skill);
});

// Project Image Hover Effects
const projectImages = document.querySelectorAll('.project-image');
projectImages.forEach(image => {
    image.addEventListener('mouseenter', () => {
        image.style.transform = 'scale(1.05)';
    });
    image.addEventListener('mouseleave', () => {
        image.style.transform = 'scale(1)';
    });
});

// Form Submission
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(contactForm);
        // Add your form submission logic here
        alert('Thank you for your message! I will get back to you soon.');
        contactForm.reset();
    });
}

// Animated Cursor with Improved Effects
const cursorTracker = document.createElement('div');
cursorTracker.classList.add('cursor-tracker');
document.body.appendChild(cursorTracker);

const updateCursorPosition = (e) => {
    cursorTracker.style.left = `${e.clientX}px`;
    cursorTracker.style.top = `${e.clientY}px`;
    
    // Add sparkles on click
    if (e.type === 'click') {
        createSparkle(e.clientX, e.clientY);
    }
};

document.addEventListener('mousemove', updateCursorPosition);
document.addEventListener('click', updateCursorPosition);

function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.classList.add('sparkle');
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    document.body.appendChild(sparkle);
    
    setTimeout(() => {
        sparkle.remove();
    }, 1000);
}

// Add Combined CSS
const style = document.createElement('style');
style.textContent = `
    .sparkle {
        position: fixed;
        width: 10px;
        height: 10px;
        background: var(--primary-color);
        border-radius: 50%;
        pointer-events: none;
        animation: sparkle 1s ease-out forwards;
    }
    
    @keyframes sparkle {
        0% {
            transform: scale(1) translateX(0) translateY(0);
            opacity: 1;
        }
        100% {
            transform: scale(0) translateX(10px) translateY(-10px);
            opacity: 0;
        }
    }
    
    .loading-screen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--background-color);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        transition: opacity 0.5s ease;
    }
    
    .main-content {
        opacity: 0;
        transition: opacity 0.5s ease;
    }
    
    .hidden {
        display: none !important;
    }
    
    .loader {
        width: 40px;
        height: 40px;
        border: 3px solid var(--primary-color);
        border-radius: 50%;
        border-top-color: transparent;
        animation: spin 0.8s linear infinite;
    }
    
    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
`;
document.head.appendChild(style); 

// Define interactive elements
const interactiveElements = document.querySelectorAll('a, button, input[type="submit"], .project-image');

// Add hover effects to interactive elements
interactiveElements.forEach(element => {
    element.addEventListener('mouseenter', () => {
        cursorTracker.classList.add('near-element');
    });

    element.addEventListener('mouseleave', () => {
        cursorTracker.classList.remove('near-element');
    });
});

// Remove duplicate cursor tracker
const existingTracker = document.querySelector('.cursor-tracker');
if (existingTracker) {
    existingTracker.remove();
}
