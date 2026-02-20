// ===================================
// NAVIGATION ACTIVE STATE
// This makes the navigation links change when you scroll
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    
    // Get all navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    const navigation = document.querySelector('.navigation');
    
    // Hamburger menu elements
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileNavLinks = document.querySelectorAll('.mobile-menu .nav-link');
    
    // Toggle mobile menu
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });
    }
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            if (!mobileMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
                hamburgerBtn.classList.remove('active');
                mobileMenu.classList.remove('active');
            }
        }
    });
    
    // Close mobile menu when clicking a link
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburgerBtn.classList.remove('active');
            mobileMenu.classList.remove('active');
        });
    });
    
    // Add click event to each link
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Remove 'active' class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            mobileNavLinks.forEach(l => l.classList.remove('active'));
            
            // Add 'active' class to clicked link
            this.classList.add('active');
            
            // Also update corresponding link in mobile/desktop menu
            const href = this.getAttribute('href');
            document.querySelectorAll(`.nav-link[href="${href}"]`).forEach(l => {
                l.classList.add('active');
            });
        });
    });
    
    // ===================================
    // FROSTED GLASS NAVIGATION ON SCROLL
    // Adds backdrop blur effect when scrolling
    // ===================================
    
    let lastScrollY = window.scrollY;
    
    function handleScroll() {
        const currentScrollY = window.scrollY;
        
        // Add frosted glass effect when scrolled down more than 20px
        if (currentScrollY > 20) {
            navigation.classList.add('scrolled');
        } else {
            navigation.classList.remove('scrolled');
        }
        
        lastScrollY = currentScrollY;
    }
    
    // Listen for scroll events
    window.addEventListener('scroll', handleScroll);
    
    // Check initial state
    handleScroll();
    
    // ===================================
    // SCROLL SPY - Auto-highlight current section
    // Detects which section is in view and highlights nav
    // ===================================
    
    const sections = document.querySelectorAll('section[id]');
    
    function scrollSpy() {
        const scrollY = window.scrollY + 200; // Offset for better detection
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop;
            const sectionId = section.getAttribute('id');
            
            // Check if section is in viewport
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                // Find the corresponding nav link
                const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
                if (navLink) {
                    // Remove active class from all links
                    navLinks.forEach(link => link.classList.remove('active'));
                    // Add active class to current section's link
                    navLink.classList.add('active');
                }
            }
        });
        
        // Default to Work when at the top
        if (scrollY < 300) {
            navLinks.forEach(link => link.classList.remove('active'));
            const workLink = document.querySelector('.nav-link[href="#work"]');
            if (workLink) workLink.classList.add('active');
        }
    }
    
    // Listen for scroll to update active section
    window.addEventListener('scroll', scrollSpy);
    
    // Run once on load
    scrollSpy();
    
    // ===================================
    // LOCATION WIDGET
    // Fetches weather and displays map
    // ===================================
    
    // Rotating phrases for hero subtitle
    const rotatingPhrases = [
        "I spend more time choosing music than actually listening to it.",
        "I can spot a misaligned pixel from across the room.",
        "My browser tabs are like my design layers—way too many.",
        "Coffee first, wireframes second, everything else maybe.",
        "I have strong opinions about button radius.",
        "Dark mode is not a phase, it's a lifestyle.",
        "I speak three languages: Italian, English, and Design Systems."
    ];
    
    let currentPhraseIndex = 0;
    
    function rotatePhrase() {
        const textElement = document.getElementById('rotatingText');
        if (textElement) {
            // Fade out
            textElement.style.opacity = '0';
            textElement.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
                // Change text
                currentPhraseIndex = (currentPhraseIndex + 1) % rotatingPhrases.length;
                textElement.textContent = rotatingPhrases[currentPhraseIndex];
                
                // Fade in
                textElement.style.opacity = '1';
                textElement.style.transform = 'translateY(0)';
            }, 500);
        }
    }
    
    // Rotate phrase every 5 seconds
    setInterval(rotatePhrase, 5000);
    
    async function initLocationWidget() {
        const location = typeof myLocation !== 'undefined' ? myLocation : {
            city: 'Madrid',
            country: 'Spain',
            lat: 40.4168,
            lon: -3.7038
        };
        
        // Update city displays
        const cityElement = document.getElementById('locationCity');
        if (cityElement) {
            cityElement.textContent = `${location.city}, ${location.country}`;
        }
        
        // Check if on vacation (not in Madrid, Spain)
        const isOnVacation = !(location.city === 'Madrid' && location.country === 'Spain');
        const vacationBadge = document.getElementById('vacationBadge');
        if (vacationBadge) {
            if (isOnVacation) {
                vacationBadge.classList.add('show');
            } else {
                vacationBadge.classList.remove('show');
            }
        }
        
        const cityMobileElement = document.getElementById('locationCityMobile');
        if (cityMobileElement) {
            cityMobileElement.textContent = location.city;
        }
        
        // Fetch weather data (using Open-Meteo - free, no API key needed)
        try {
            const weatherResponse = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current_weather=true`
            );
            const weatherData = await weatherResponse.json();
            
            if (weatherData.current_weather) {
                const temp = Math.round(weatherData.current_weather.temperature);
                const weatherCode = weatherData.current_weather.weathercode;
                
                // Weather code to icon and description mapping
                const weatherInfo = getWeatherInfo(weatherCode);
                
                // Update desktop weather display
                const tempElement = document.getElementById('weatherTemp');
                if (tempElement) {
                    tempElement.textContent = `${temp}°C`;
                }
                
                const iconElement = document.getElementById('weatherIcon');
                if (iconElement) {
                    iconElement.textContent = weatherInfo.icon;
                }
                
                const descElement = document.getElementById('weatherDesc');
                if (descElement) {
                    descElement.textContent = weatherInfo.desc;
                }
                
                // Update mobile weather display
                const tempMobileElement = document.getElementById('weatherTempMobile');
                if (tempMobileElement) {
                    tempMobileElement.textContent = `${temp}°`;
                }
                
                const iconMobileElement = document.getElementById('weatherIconMobile');
                if (iconMobileElement) {
                    iconMobileElement.textContent = weatherInfo.icon;
                }
            }
        } catch (error) {
            console.error('Weather fetch error:', error);
            const descElement = document.getElementById('weatherDesc');
            if (descElement) {
                descElement.textContent = 'Weather unavailable';
            }
        }
    }
    
    // Weather code to icon mapping (Open-Meteo weather codes)
    function getWeatherInfo(code) {
        const weatherMap = {
            0: { icon: '☀️', desc: 'Clear' },
            1: { icon: '🌤️', desc: 'Mainly clear' },
            2: { icon: '⛅', desc: 'Partly cloudy' },
            3: { icon: '☁️', desc: 'Cloudy' },
            45: { icon: '🌫️', desc: 'Foggy' },
            48: { icon: '🌫️', desc: 'Foggy' },
            51: { icon: '🌦️', desc: 'Light drizzle' },
            53: { icon: '🌦️', desc: 'Drizzle' },
            55: { icon: '🌧️', desc: 'Heavy drizzle' },
            61: { icon: '🌧️', desc: 'Light rain' },
            63: { icon: '🌧️', desc: 'Rain' },
            65: { icon: '🌧️', desc: 'Heavy rain' },
            71: { icon: '🌨️', desc: 'Light snow' },
            73: { icon: '❄️', desc: 'Snow' },
            75: { icon: '❄️', desc: 'Heavy snow' },
            77: { icon: '🌨️', desc: 'Snow grains' },
            80: { icon: '🌦️', desc: 'Light showers' },
            81: { icon: '🌧️', desc: 'Showers' },
            82: { icon: '⛈️', desc: 'Heavy showers' },
            85: { icon: '🌨️', desc: 'Snow showers' },
            86: { icon: '❄️', desc: 'Heavy snow showers' },
            95: { icon: '⛈️', desc: 'Thunderstorm' },
            96: { icon: '⛈️', desc: 'Thunderstorm with hail' },
            99: { icon: '⛈️', desc: 'Heavy thunderstorm' }
        };
        
        return weatherMap[code] || { icon: '🌤️', desc: 'Unknown' };
    }
    
    // Initialize location widget
    initLocationWidget();
    
    // ===================================
    // NDA PASSWORD PROTECTION
    // Handles password-protected projects
    // ===================================
    
    // SHA-256 hash function for password verification
    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    // Accepted password hashes
    // Password 1: "FuckUniversallySpeaking"
    // Password 2: "RedDeadRockstar2025"
    const ACCEPTED_PASSWORD_HASHES = [
        "2b1bf3c7cd0927a3f0c48e44d6c3784c081910a8849234a3cb6ef71815973b6d",
        "c3b34babd4342449e7406c59aaddf618fa5691849642094110b3b551fe878a67"
    ];
    
    const ndaModal = document.getElementById('ndaModal');
    const ndaPasswordInput = document.getElementById('ndaPasswordInput');
    const ndaPasswordToggle = document.getElementById('ndaPasswordToggle');
    const ndaSubmitBtn = document.getElementById('ndaSubmitBtn');
    const ndaCancelBtn = document.getElementById('ndaCancelBtn');
    const ndaErrorMessage = document.getElementById('ndaErrorMessage');
    
    let currentNdaProject = null;
    
    // Password visibility toggle
    if (ndaPasswordToggle) {
        ndaPasswordToggle.addEventListener('click', function() {
            const type = ndaPasswordInput.getAttribute('type');
            if (type === 'password') {
                ndaPasswordInput.setAttribute('type', 'text');
                // Change to eye-closed icon
                ndaPasswordToggle.innerHTML = `
                    <svg class="eye-closed" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                `;
            } else {
                ndaPasswordInput.setAttribute('type', 'password');
                // Change to eye-open icon
                ndaPasswordToggle.innerHTML = `
                    <svg class="eye-open" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                `;
            }
        });
    }
    
    // Click on NDA overlay to open password modal
    const ndaOverlays = document.querySelectorAll('.nda-overlay');
    console.log('Found NDA overlays:', ndaOverlays.length);
    ndaOverlays.forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            console.log('NDA overlay clicked');
            e.preventDefault(); // Prevent link navigation
            e.stopPropagation(); // Stop event from bubbling to link
            const projectCard = this.closest('.project-card');
            currentNdaProject = projectCard;
            openNdaModal();
        });
    });
    
    function openNdaModal() {
        ndaModal.classList.add('active');
        ndaPasswordInput.value = '';
        ndaPasswordInput.setAttribute('type', 'password');
        // Reset to eye-open icon
        ndaPasswordToggle.innerHTML = `
            <svg class="eye-open" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
            </svg>
        `;
        ndaPasswordInput.classList.remove('error');
        ndaErrorMessage.classList.remove('show');
        // Focus input after animation
        setTimeout(() => ndaPasswordInput.focus(), 100);
    }
    
    function closeNdaModal() {
        ndaModal.classList.remove('active');
        currentNdaProject = null;
    }
    
    // Cancel button
    ndaCancelBtn.addEventListener('click', closeNdaModal);
    
    // Click outside modal to close
    ndaModal.addEventListener('click', function(e) {
        if (e.target === ndaModal) {
            closeNdaModal();
        }
    });
    
    // Submit password
    async function submitPassword() {
        const password = ndaPasswordInput.value;
        const hash = await hashPassword(password);
        
        if (ACCEPTED_PASSWORD_HASHES.includes(hash)) {
            // Correct password - unlock project
            unlockProject(currentNdaProject);
            closeNdaModal();
            
            // Store unlock state in session
            sessionStorage.setItem('nda-unlocked', 'true');
        } else {
            // Wrong password
            ndaPasswordInput.classList.add('error');
            ndaErrorMessage.classList.add('show');
            
            // Remove error state after animation
            setTimeout(() => {
                ndaPasswordInput.classList.remove('error');
            }, 500);
        }
    }
    
    function unlockProject(projectCard) {
        if (!projectCard) return;
        
        // Add unlocked class to card
        projectCard.classList.add('unlocked');
        
        // Enable the link
        const link = projectCard.querySelector('.project-image-link.nda-link');
        if (link) {
            link.classList.add('unlocked');
        }
        
        // Hide overlay
        const overlay = projectCard.querySelector('.nda-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
        
        // Remove particle containers after animation
        setTimeout(() => {
            const particleContainers = projectCard.querySelectorAll('.particle-container');
            particleContainers.forEach(container => container.remove());
        }, 1000);
    }
    
    // Submit on button click
    ndaSubmitBtn.addEventListener('click', submitPassword);
    
    // Submit on Enter key
    ndaPasswordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            submitPassword();
        }
    });
    
    // Check if already unlocked in this session
    if (sessionStorage.getItem('nda-unlocked') === 'true') {
        document.querySelectorAll('.project-card.nda-protected').forEach(card => {
            unlockProject(card);
        });
    }
    
    // Prevent navigation on locked NDA image links
    document.querySelectorAll('.project-image-link.nda-link').forEach(link => {
        link.addEventListener('click', function(e) {
            if (!this.classList.contains('unlocked')) {
                e.preventDefault(); // Don't follow link when locked
            }
        });
    });
    
    // ===================================
    // PARTICLE SYSTEM FOR NDA TEXT
    // Creates floating particles over hidden text
    // ===================================
    
    function createParticleSystem(element) {
        const rect = element.getBoundingClientRect();
        const container = document.createElement('div');
        container.className = 'particle-container';
        container.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            overflow: hidden;
        `;
        
        // Calculate number of particles based on element width
        const width = rect.width;
        const numParticles = Math.floor(width / 5); // About 1 particle per 5px
        const particles = [];
        
        for (let i = 0; i < numParticles; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random position within actual text bounds
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const size = Math.random() * 3 + 2; // 2-5px
            const opacity = Math.random() * 0.3 + 0.2; // 0.2-0.5
            const duration = Math.random() * 3 + 3; // 3-6s
            const delay = Math.random() * 2;
            
            particle.style.cssText = `
                position: absolute;
                left: ${x}%;
                top: ${y}%;
                width: ${size}px;
                height: ${size}px;
                background: rgba(136, 136, 136, ${opacity});
                border-radius: 50%;
                animation: particle-drift ${duration}s ease-in-out ${delay}s infinite;
            `;
            
            container.appendChild(particle);
            particles.push(particle);
        }
        
        element.style.position = 'relative';
        element.appendChild(container);
        
        return container;
    }
    
    // Initialize particles for protected text elements
    document.querySelectorAll('.project-card.nda-protected').forEach(card => {
        if (!card.classList.contains('unlocked')) {
            // Add particles to title
            const title = card.querySelector('.project-title');
            if (title) createParticleSystem(title);
            
            // Add particles to hidden text spans
            const hiddenTexts = card.querySelectorAll('.nda-hidden-text');
            hiddenTexts.forEach(text => createParticleSystem(text));
        }
    });
    
    // Initialize particles for NDA protected accordion items
    document.querySelectorAll('.project-list-item.nda-protected-item').forEach(item => {
        // Check release date
        const releaseDate = item.getAttribute('data-release-date');
        const today = new Date();
        
        if (releaseDate) {
            const release = new Date(releaseDate);
            
            // Auto-unlock if release date has passed
            if (today >= release) {
                item.classList.add('unlocked');
                return; // Skip particle creation, it's released
            }
        }
        
        // Add smaller particles to hidden text in accordion
        const hiddenTexts = item.querySelectorAll('.nda-hidden-text');
        hiddenTexts.forEach(text => {
            const rect = text.getBoundingClientRect();
            const numParticles = Math.max(Math.floor(rect.width / 8), 15); // Min 15 particles
            
            const container = document.createElement('div');
            container.className = 'particle-container';
            container.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                overflow: hidden;
            `;
            
            for (let i = 0; i < numParticles; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                
                const x = Math.random() * 100;
                const y = Math.random() * 100;
                const size = Math.random() * 2 + 1.5; // Smaller for list items
                const opacity = Math.random() * 0.3 + 0.2;
                const duration = Math.random() * 3 + 3;
                const delay = Math.random() * 2;
                
                particle.style.cssText = `
                    position: absolute;
                    left: ${x}%;
                    top: ${y}%;
                    width: ${size}px;
                    height: ${size}px;
                    background: rgba(136, 136, 136, ${opacity});
                    border-radius: 50%;
                    animation: particle-drift ${duration}s ease-in-out ${delay}s infinite;
                `;
                
                container.appendChild(particle);
            }
            
            text.style.position = 'relative';
            text.appendChild(container);
        });
    });
    
    // ===================================
    // ACCORDION TOGGLE FOR OTHER PROJECTS
    // Expands/collapses the projects list
    // ===================================
    
    const accordionTrigger = document.getElementById('accordionTrigger');
    const accordionContent = document.getElementById('accordionContent');
    const accordionIcon = document.getElementById('accordionIcon');
    
    if (accordionTrigger) {
        accordionTrigger.addEventListener('click', function() {
            const isOpen = accordionContent.classList.contains('open');
            
            if (isOpen) {
                // Close accordion
                accordionContent.classList.remove('open');
                accordionTrigger.classList.remove('active');
            } else {
                // Open accordion
                accordionContent.classList.add('open');
                accordionTrigger.classList.add('active');
            }
        });
    }
    
    // ===================================
    // SMOOTH SCROLL BEHAVIOR
    // Makes the page scroll smoothly when clicking links
    // ===================================
    
    // This is already handled by CSS (scroll-behavior: smooth)
    // but we can add custom behavior here if needed
    
    // ===================================
    // PROJECT CARDS FADE IN ON SCROLL
    // Makes cards appear as you scroll down (optional)
    // ===================================
    
    function initProjectCards() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        // Observe all project cards
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach(card => {
            // Check if card is already in viewport on page load
            const rect = card.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (isVisible) {
                // Card is already visible - show immediately without animation
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            } else {
                // Card is below fold - set up animation
                card.style.opacity = '0';
                card.style.transform = 'translateY(30px)';
                card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                
                // Start observing
                observer.observe(card);
            }
        });
    }
    
    // Run after all images are loaded
    if (document.readyState === 'complete') {
        initProjectCards();
    } else {
        window.addEventListener('load', initProjectCards);
    }
    
    // ===================================
    // CONSOLE MESSAGE (optional - just for fun!)
    // ===================================
    
    console.log('%c👋 Hello! Thanks for checking out my portfolio!', 'font-size: 20px; color: #888;');
    console.log('%c🎵 Still choosing music...', 'font-size: 16px; color: #888;');
});

// ===================================
// HELPER FUNCTION: Scroll to section
// You can use this if you want more control
// ===================================

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}