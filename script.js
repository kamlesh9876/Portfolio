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

document.getElementById('toggle-theme').addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
});

const scrollTopBtn = document.getElementById('scrollTopBtn');
scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
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
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollTopBtn.style.display = 'block';
    } else {
        scrollTopBtn.style.display = 'none';
    }
});
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
const cursorTracker = document.createElement('div');
cursorTracker.classList.add('cursor-tracker');
document.body.appendChild(cursorTracker);

const updateCursorPosition = (e) => {
    cursorTracker.style.left = `${e.clientX}px`;
    cursorTracker.style.top = `${e.clientY}px`;

    const randomShape = Math.floor(Math.random() * 3);  

    cursorTracker.classList.remove('shape-circle', 'shape-square', 'shape-triangle');

    if (randomShape === 0) {
        cursorTracker.classList.add('shape-circle');
    } else if (randomShape === 1) {
        cursorTracker.classList.add('shape-square');
    } else {
        cursorTracker.classList.add('shape-triangle');
    }

    cursorTracker.style.animation = 'morphAnimation 1s ease-in-out infinite';
};

document.addEventListener('mousemove', updateCursorPosition);

const interactiveElements = document.querySelectorAll('.interactive'); 
interactiveElements.forEach(element => {
    element.addEventListener('mouseenter', () => {
        cursorTracker.classList.add('near-element');
    });

    element.addEventListener('mouseleave', () => {
        cursorTracker.classList.remove('near-element');
    });
});
const tracker = document.createElement('div');
tracker.classList.add('cursor-tracker', 'circle'); 
document.body.appendChild(tracker);

document.addEventListener('mousemove', (e) => {
    tracker.style.left = `${e.clientX}px`;
    tracker.style.top = `${e.clientY}px`;
});
