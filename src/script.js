// Import styles for webpack
import './styles.css';

// =================
// Navigation
// =================
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    // Mobile menu toggle
    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        
        // Animate hamburger menu
        const bars = navToggle.querySelectorAll('.bar');
        bars.forEach((bar, index) => {
            if (navMenu.classList.contains('active')) {
                if (index === 0) bar.style.transform = 'rotate(45deg) translate(5px, 5px)';
                if (index === 1) bar.style.opacity = '0';
                if (index === 2) bar.style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                bar.style.transform = 'none';
                bar.style.opacity = '1';
            }
        });
    });
    
    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            const bars = navToggle.querySelectorAll('.bar');
            bars.forEach(bar => {
                bar.style.transform = 'none';
                bar.style.opacity = '1';
            });
        });
    });
    
    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Change navbar style on scroll
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(0, 0, 0, 0.98)';
        } else {
            navbar.style.background = 'rgba(0, 0, 0, 0.95)';
        }
    });
});

// =================
// Intersection Observer for Animations
// =================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all elements with animation classes
document.addEventListener('DOMContentLoaded', function() {
    const animateElements = document.querySelectorAll('.animate-on-scroll, .service-card, .team-member, .stat-item');
    animateElements.forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });
});

// =================
// Counter Animation
// =================
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const count = +counter.innerText;
        const increment = target / 100;
        
        if (count < target) {
            counter.innerText = Math.ceil(count + increment);
            setTimeout(() => animateCounters(), 20);
        } else {
            counter.innerText = target;
        }
    });
}

// Trigger counter animation when stats section is visible
const statsObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.addEventListener('DOMContentLoaded', function() {
    const statsSection = document.querySelector('.stats');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }
});

// =================
// Achievements Management
// =================
class AchievementsManager {
    constructor() {
        this.achievements = this.loadAchievements();
        this.init();
    }
    
    init() {
        this.renderAchievements();
    }
    
    loadAchievements() {
        const saved = localStorage.getItem('itaul-achievements');
        if (saved) {
            return JSON.parse(saved);
        }
        
        // Default achievements
        return [
            {
                id: 1,
                title: "Победа в хакатоне Moscow City Hack",
                description: "Первое место в номинации 'Лучшее техническое решение' с проектом городской мобильности",
                date: "2024-03-15"
            },
            {
                id: 2,
                title: "Разработка MVP для стартапа EcoTech",
                description: "Создали минимально жизнеспособный продукт за 2 недели, который привлек первых инвесторов",
                date: "2024-02-28"
            },
            {
                id: 3,
                title: "Участие в Digital Breakthrough",
                description: "Вошли в топ-10 команд в треке 'Искусственный интеллект и машинное обучение'",
                date: "2024-01-20"
            }
        ];
    }
    

    

    
    renderAchievements() {
        const container = document.getElementById('achievements-content');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.achievements.forEach(achievement => {
            const achievementEl = document.createElement('div');
            achievementEl.className = 'achievement-item animate-on-scroll';
            achievementEl.innerHTML = `
                <div class="achievement-date">${this.formatDate(achievement.date)}</div>
                <h4 class="achievement-title">${achievement.title}</h4>
                <p class="achievement-description">${achievement.description}</p>
            `;
            container.appendChild(achievementEl);
        });
        
        // Re-observe new elements
        const newElements = container.querySelectorAll('.animate-on-scroll');
        newElements.forEach(el => observer.observe(el));
    }
    

    

    
    formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('ru-RU', options);
    }
    
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#2ecc71' : '#3498db'};
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize achievements manager
let achievementsManager;
document.addEventListener('DOMContentLoaded', function() {
    achievementsManager = new AchievementsManager();
});

// =================
// Contact Form
// =================
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                subject: formData.get('subject'),
                message: formData.get('message')
            };
            
            // Add loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Отправляем...';
            submitBtn.disabled = true;
            
            // Send email using mailto
            const emailSubject = encodeURIComponent(`Новая заявка от ${data.name}: ${data.subject}`);
            const emailBody = encodeURIComponent(
                `Имя: ${data.name}\n` +
                `Email: ${data.email}\n` +
                `Тема: ${data.subject}\n\n` +
                `Сообщение:\n${data.message}\n\n` +
                `---\nОтправлено с лендинга IT-AUL`
            );
            
            // Open mail client
            window.location.href = `mailto:ranel-h@mail.ru?subject=${emailSubject}&body=${emailBody}`;
            
            // Reset form and show notification
            setTimeout(() => {
                this.reset();
                
                // Show success message
                if (achievementsManager) {
                    achievementsManager.showNotification('Почтовый клиент открыт! Отправьте сообщение для связи.', 'success');
                }
                
                // Reset button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 1000);
        });
    }
});

// =================
// Parallax Effect
// =================
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.floating-pixel');
    
    parallaxElements.forEach((element, index) => {
        const speed = 0.1 + (index * 0.05);
        const translateY = scrolled * speed;
        element.style.transform = `translateY(${translateY}px)`;
    });
});

// =================
// Typing Effect
// =================
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// =================
// Additional Animations
// =================
document.addEventListener('DOMContentLoaded', function() {
    // Add CSS for notifications
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .btn-delete {
            transition: all 0.3s ease;
        }
        
        .btn-delete:hover {
            color: #ff3742 !important;
            transform: scale(1.05);
        }
    `;
    document.head.appendChild(style);
    
    // Add hover effects to service cards
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) rotateX(5deg)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) rotateX(0)';
        });
    });
    
    // Add particle effect to hero section
    createParticles();
});

// =================
// Particle Effect
// =================
function createParticles() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: #DDD92A;
            border-radius: 50%;
            opacity: 0.3;
            animation: particle-float ${5 + Math.random() * 10}s linear infinite;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            z-index: 1;
        `;
        hero.appendChild(particle);
    }
    
    // Add particle animation CSS
    const particleStyle = document.createElement('style');
    particleStyle.textContent = `
        @keyframes particle-float {
            0% {
                transform: translateY(0) scale(1);
                opacity: 0.3;
            }
            50% {
                opacity: 0.6;
                transform: scale(1.2);
            }
            100% {
                transform: translateY(-100vh) scale(0.8);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(particleStyle);
}

// =================
// Performance Optimizations
// =================
// Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debounce to scroll-heavy functions
const debouncedScroll = debounce(() => {
    // Heavy scroll operations here
}, 16); // ~60fps

window.addEventListener('scroll', debouncedScroll);

// =================
// Dark Mode Toggle (Optional)
// =================
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// Load dark mode preference
document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
});

// =================
// Preloader
// =================
window.addEventListener('load', function() {
    const preloader = document.createElement('div');
    preloader.id = 'preloader';
    preloader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #000;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        transition: opacity 0.5s ease;
    `;
    
    const logo = document.createElement('img');
    logo.src = 'Frame 9.svg';
    logo.style.cssText = `
        width: 100px;
        height: 100px;
        animation: pulse 1s ease-in-out infinite alternate;
    `;
    
    preloader.appendChild(logo);
    document.body.appendChild(preloader);
    
    // Add pulse animation
    const pulseStyle = document.createElement('style');
    pulseStyle.textContent = `
        @keyframes pulse {
            from { transform: scale(1); opacity: 0.8; }
            to { transform: scale(1.1); opacity: 1; }
        }
    `;
    document.head.appendChild(pulseStyle);
    
    // Remove preloader after 1 second
    setTimeout(() => {
        preloader.style.opacity = '0';
        setTimeout(() => {
            if (preloader.parentNode) {
                preloader.parentNode.removeChild(preloader);
            }
        }, 500);
    }, 1000);
}); 