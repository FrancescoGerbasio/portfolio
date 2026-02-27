// ===================================
// NAVIGATION ACTIVE STATE
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    
    const navLinks = document.querySelectorAll('.nav-link');
    const navigation = document.querySelector('.navigation');
    
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileNavLinks = document.querySelectorAll('.mobile-menu .nav-link');
    
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });
    }
    
    document.addEventListener('click', function(e) {
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            if (!mobileMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
                hamburgerBtn.classList.remove('active');
                mobileMenu.classList.remove('active');
            }
        }
    });
    
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburgerBtn.classList.remove('active');
            mobileMenu.classList.remove('active');
        });
    });
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            navLinks.forEach(l => l.classList.remove('active'));
            mobileNavLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            const href = this.getAttribute('href');
            document.querySelectorAll(`.nav-link[href="${href}"]`).forEach(l => {
                l.classList.add('active');
            });
        });
    });
    
    // ===================================
    // FROSTED GLASS NAV ON SCROLL
    // ===================================
    
    let lastScrollY = window.scrollY;
    
    function handleScroll() {
        const currentScrollY = window.scrollY;
        if (currentScrollY > 20) {
            navigation.classList.add('scrolled');
        } else {
            navigation.classList.remove('scrolled');
        }
        lastScrollY = currentScrollY;
    }
    
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    // ===================================
    // SCROLL SPY
    // ===================================
    
    const sections = document.querySelectorAll('section[id]');
    
    function scrollSpy() {
        const scrollY = window.scrollY + 200;
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop;
            const sectionId = section.getAttribute('id');
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
                if (navLink) {
                    navLinks.forEach(link => link.classList.remove('active'));
                    navLink.classList.add('active');
                }
            }
        });
        if (scrollY < 300) {
            navLinks.forEach(link => link.classList.remove('active'));
            const workLink = document.querySelector('.nav-link[href="#work"]');
            if (workLink) workLink.classList.add('active');
        }
    }
    
    window.addEventListener('scroll', scrollSpy);
    scrollSpy();
    
    // ===================================
    // ROTATING PHRASES
    // ===================================
    
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
            textElement.style.opacity = '0';
            textElement.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                currentPhraseIndex = (currentPhraseIndex + 1) % rotatingPhrases.length;
                textElement.textContent = rotatingPhrases[currentPhraseIndex];
                textElement.style.opacity = '1';
                textElement.style.transform = 'translateY(0)';
            }, 500);
        }
    }
    
    setInterval(rotatePhrase, 5000);
    
    // ===================================
    // LOCATION & WEATHER WIDGET
    // ===================================
    
    async function initLocationWidget() {
        const location = typeof myLocation !== 'undefined' ? myLocation : {
            city: 'Madrid', country: 'Spain', lat: 40.4168, lon: -3.7038
        };
        
        const cityElement = document.getElementById('locationCity');
        if (cityElement) cityElement.textContent = `${location.city}, ${location.country}`;
        
        const isOnVacation = !(location.city === 'Madrid' && location.country === 'Spain');
        const vacationBadge = document.getElementById('vacationBadge');
        if (vacationBadge) {
            isOnVacation ? vacationBadge.classList.add('show') : vacationBadge.classList.remove('show');
        }
        
        const cityMobileElement = document.getElementById('locationCityMobile');
        if (cityMobileElement) cityMobileElement.textContent = location.city;
        
        try {
            const weatherResponse = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current_weather=true`
            );
            const weatherData = await weatherResponse.json();
            
            if (weatherData.current_weather) {
                const temp = Math.round(weatherData.current_weather.temperature);
                const weatherInfo = getWeatherInfo(weatherData.current_weather.weathercode);
                
                const tempEl = document.getElementById('weatherTemp');
                if (tempEl) tempEl.textContent = `${temp}°C`;
                const iconEl = document.getElementById('weatherIcon');
                if (iconEl) iconEl.textContent = weatherInfo.icon;
                const descEl = document.getElementById('weatherDesc');
                if (descEl) descEl.textContent = weatherInfo.desc;
                const tempMobileEl = document.getElementById('weatherTempMobile');
                if (tempMobileEl) tempMobileEl.textContent = `${temp}°`;
                const iconMobileEl = document.getElementById('weatherIconMobile');
                if (iconMobileEl) iconMobileEl.textContent = weatherInfo.icon;
            }
        } catch (error) {
            const descEl = document.getElementById('weatherDesc');
            if (descEl) descEl.textContent = 'Weather unavailable';
        }
    }
    
    function getWeatherInfo(code) {
        const weatherMap = {
            0: { icon: '☀️', desc: 'Clear' }, 1: { icon: '🌤️', desc: 'Mainly clear' },
            2: { icon: '⛅', desc: 'Partly cloudy' }, 3: { icon: '☁️', desc: 'Cloudy' },
            45: { icon: '🌫️', desc: 'Foggy' }, 48: { icon: '🌫️', desc: 'Foggy' },
            51: { icon: '🌦️', desc: 'Light drizzle' }, 53: { icon: '🌦️', desc: 'Drizzle' },
            55: { icon: '🌧️', desc: 'Heavy drizzle' }, 61: { icon: '🌧️', desc: 'Light rain' },
            63: { icon: '🌧️', desc: 'Rain' }, 65: { icon: '🌧️', desc: 'Heavy rain' },
            71: { icon: '🌨️', desc: 'Light snow' }, 73: { icon: '❄️', desc: 'Snow' },
            75: { icon: '❄️', desc: 'Heavy snow' }, 80: { icon: '🌦️', desc: 'Light showers' },
            81: { icon: '🌧️', desc: 'Showers' }, 82: { icon: '⛈️', desc: 'Heavy showers' },
            95: { icon: '⛈️', desc: 'Thunderstorm' }, 96: { icon: '⛈️', desc: 'Thunderstorm with hail' },
            99: { icon: '⛈️', desc: 'Heavy thunderstorm' }
        };
        return weatherMap[code] || { icon: '🌤️', desc: 'Unknown' };
    }
    
    initLocationWidget();
    
    // ===================================
    // NDA PASSWORD PROTECTION
    // ===================================
    
    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
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
    
    if (ndaPasswordToggle) {
        ndaPasswordToggle.addEventListener('click', function() {
            const type = ndaPasswordInput.getAttribute('type');
            if (type === 'password') {
                ndaPasswordInput.setAttribute('type', 'text');
                ndaPasswordToggle.innerHTML = `<svg class="eye-closed" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
            } else {
                ndaPasswordInput.setAttribute('type', 'password');
                ndaPasswordToggle.innerHTML = `<svg class="eye-open" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
            }
        });
    }
    
    document.querySelectorAll('.nda-overlay').forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            currentNdaProject = this.closest('.project-card');
            openNdaModal();
        });
    });
    
    function openNdaModal() {
        ndaModal.classList.add('active');
        ndaPasswordInput.value = '';
        ndaPasswordInput.setAttribute('type', 'password');
        ndaPasswordToggle.innerHTML = `<svg class="eye-open" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
        ndaPasswordInput.classList.remove('error');
        ndaErrorMessage.classList.remove('show');
        setTimeout(() => ndaPasswordInput.focus(), 100);
    }
    
    function closeNdaModal() {
        ndaModal.classList.remove('active');
        currentNdaProject = null;
    }
    
    ndaCancelBtn.addEventListener('click', closeNdaModal);
    ndaModal.addEventListener('click', function(e) { if (e.target === ndaModal) closeNdaModal(); });
    
    async function submitPassword() {
        const password = ndaPasswordInput.value;
        const hash = await hashPassword(password);
        if (ACCEPTED_PASSWORD_HASHES.includes(hash)) {
            unlockProject(currentNdaProject);
            closeNdaModal();
            sessionStorage.setItem('nda-unlocked', 'true');
        } else {
            ndaPasswordInput.classList.add('error');
            ndaErrorMessage.classList.add('show');
            setTimeout(() => ndaPasswordInput.classList.remove('error'), 500);
        }
    }
    
    function unlockProject(projectCard) {
        if (!projectCard) return;
        projectCard.classList.add('unlocked');
        const link = projectCard.querySelector('.project-image-link.nda-link');
        if (link) link.classList.add('unlocked');
        const overlay = projectCard.querySelector('.nda-overlay');
        if (overlay) overlay.classList.add('hidden');
        setTimeout(() => {
            projectCard.querySelectorAll('.particle-container').forEach(c => c.remove());
        }, 1000);
    }
    
    ndaSubmitBtn.addEventListener('click', submitPassword);
    ndaPasswordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') submitPassword();
    });
    
    if (sessionStorage.getItem('nda-unlocked') === 'true') {
        document.querySelectorAll('.project-card.nda-protected').forEach(card => unlockProject(card));
    }
    
    document.querySelectorAll('.project-image-link.nda-link').forEach(link => {
        link.addEventListener('click', function(e) {
            if (!this.classList.contains('unlocked')) e.preventDefault();
        });
    });
    
    // ===================================
    // PARTICLE SYSTEM
    // ===================================
    
    function createParticleSystem(element) {
        const rect = element.getBoundingClientRect();
        const container = document.createElement('div');
        container.className = 'particle-container';
        container.style.cssText = `position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:hidden;`;
        const numParticles = Math.floor(rect.width / 5);
        for (let i = 0; i < numParticles; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            const x = Math.random() * 100, y = Math.random() * 100;
            const size = Math.random() * 3 + 2;
            const opacity = Math.random() * 0.3 + 0.2;
            const duration = Math.random() * 3 + 3;
            const delay = Math.random() * 2;
            particle.style.cssText = `position:absolute;left:${x}%;top:${y}%;width:${size}px;height:${size}px;background:rgba(136,136,136,${opacity});border-radius:50%;animation:particle-drift ${duration}s ease-in-out ${delay}s infinite;`;
            container.appendChild(particle);
        }
        element.style.position = 'relative';
        element.appendChild(container);
        return container;
    }
    
    document.querySelectorAll('.project-card.nda-protected').forEach(card => {
        if (!card.classList.contains('unlocked')) {
            const title = card.querySelector('.project-title');
            if (title) createParticleSystem(title);
            card.querySelectorAll('.nda-hidden-text').forEach(text => createParticleSystem(text));
        }
    });
    
    document.querySelectorAll('.project-list-item.nda-protected-item').forEach(item => {
        const releaseDate = item.getAttribute('data-release-date');
        const today = new Date();
        if (releaseDate && today >= new Date(releaseDate)) {
            item.classList.add('unlocked');
            return;
        }
        item.querySelectorAll('.nda-hidden-text').forEach(text => {
            const rect = text.getBoundingClientRect();
            const numParticles = Math.max(Math.floor(rect.width / 8), 15);
            const container = document.createElement('div');
            container.className = 'particle-container';
            container.style.cssText = `position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:hidden;`;
            for (let i = 0; i < numParticles; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                const x = Math.random() * 100, y = Math.random() * 100;
                const size = Math.random() * 2 + 1.5;
                const opacity = Math.random() * 0.3 + 0.2;
                const duration = Math.random() * 3 + 3;
                const delay = Math.random() * 2;
                particle.style.cssText = `position:absolute;left:${x}%;top:${y}%;width:${size}px;height:${size}px;background:rgba(136,136,136,${opacity});border-radius:50%;animation:particle-drift ${duration}s ease-in-out ${delay}s infinite;`;
                container.appendChild(particle);
            }
            text.style.position = 'relative';
            text.appendChild(container);
        });
    });
    
    // ===================================
    // ACCORDION — Other Projects
    // ===================================
    
    const accordionTrigger = document.getElementById('accordionTrigger');
    const accordionContent = document.getElementById('accordionContent');
    
    if (accordionTrigger) {
        accordionTrigger.addEventListener('click', function() {
            const isOpen = accordionContent.classList.contains('open');
            if (isOpen) {
                accordionContent.classList.remove('open');
                accordionTrigger.classList.remove('active');
            } else {
                accordionContent.classList.add('open');
                accordionTrigger.classList.add('active');
            }
        });
    }
    
    // ===================================
    // PROJECT CARDS FADE IN ON SCROLL
    // ===================================
    
    function initProjectCards() {
        const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -100px 0px' };
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        document.querySelectorAll('.project-card').forEach(card => {
            const rect = card.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            if (isVisible) {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(30px)';
                card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                observer.observe(card);
            }
        });
    }
    
    if (document.readyState === 'complete') {
        initProjectCards();
    } else {
        window.addEventListener('load', initProjectCards);
    }
    
    console.log('%c👋 Hello! Thanks for checking out my portfolio!', 'font-size: 20px; color: #888;');
    console.log('%c🎵 Still choosing music...', 'font-size: 16px; color: #888;');
});

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}