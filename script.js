// Typing Effect
const text = "Hello  Guys! I'm A Devloper";
let index = 0;
const typingText = document.getElementById('typing-text');

function typeWriter() {
    if (index < text.length) {
        typingText.innerHTML += text.charAt(index);
        index++;
        setTimeout(typeWriter, 100);
    }
}

window.onload = () => {
    typeWriter();
};

// Toggle Theme
document.getElementById('toggle-theme').addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
});

// Scroll To Top
const scrollTopBtn = document.getElementById('scrollTopBtn');
scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
// Scroll Animations
const sections = document.querySelectorAll('.section');

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show-section');
        }
    });
}, {
    threshold: 0.2
});

sections.forEach(section => {
    observer.observe(section);
});
// Show/hide Scroll to Top button
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollTopBtn.style.display = 'block';
    } else {
        scrollTopBtn.style.display = 'none';
    }
});
// Animate Bitmoji when Section is visible
const bitmojis = document.querySelectorAll('.bitmoji');

const bitmojiObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show-bitmoji');
        }
    });
}, {
    threshold: 0.3
});

bitmojis.forEach(bitmoji => {
    bitmojiObserver.observe(bitmoji);
});
const skillObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const progress = entry.target.querySelector('.progress');
            const value = progress.getAttribute('data-progress');
            progress.style.width = value + '%';
        }
    });
}, { threshold: 0.3 });

document.querySelectorAll('.skill').forEach(skill => {
    skillObserver.observe(skill);
});
// Create the cursor tracker element
const cursorTracker = document.createElement('div');
cursorTracker.classList.add('cursor-tracker');
document.body.appendChild(cursorTracker);

// Function to update the position of the cursor tracker and morph the shape
const updateCursorPosition = (e) => {
    cursorTracker.style.left = `${e.clientX}px`;
    cursorTracker.style.top = `${e.clientY}px`;

    // Randomly change the shape with a more professional and fluid transition
    const randomShape = Math.floor(Math.random() * 3);  // Random number between 0 and 2

    // Remove all shape classes before adding the new one
    cursorTracker.classList.remove('shape-circle', 'shape-square', 'shape-triangle');

    // Add the corresponding shape class
    if (randomShape === 0) {
        cursorTracker.classList.add('shape-circle');
    } else if (randomShape === 1) {
        cursorTracker.classList.add('shape-square');
    } else {
        cursorTracker.classList.add('shape-triangle');
    }

    // Add animation for smooth shape morphing
    cursorTracker.style.animation = 'morphAnimation 1s ease-in-out infinite';
};

// Add the event listener to track mouse movement
document.addEventListener('mousemove', updateCursorPosition);

// Add hover effect interaction
const interactiveElements = document.querySelectorAll('.interactive'); // Replace '.interactive' with class names of elements you want to interact with
interactiveElements.forEach(element => {
    element.addEventListener('mouseenter', () => {
        cursorTracker.classList.add('near-element');
    });

    element.addEventListener('mouseleave', () => {
        cursorTracker.classList.remove('near-element');
    });
});
const tracker = document.createElement('div');
tracker.classList.add('cursor-tracker', 'circle'); // 'circle', 'square', or 'triangle'
document.body.appendChild(tracker);

document.addEventListener('mousemove', (e) => {
    tracker.style.left = `${e.clientX}px`;
    tracker.style.top = `${e.clientY}px`;
});
