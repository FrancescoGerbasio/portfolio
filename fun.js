// ===================================
// FUN PAGE - LOCAL DATA (NO APIs)
// ===================================

// Category subtitles (body text descriptions)
const CATEGORY_SUBTITLES = {
    travel: 'Places I\'ve been and stories from the road. Every journey tells a story, and these are mine captured through moments and memories.',
    music: 'Songs I\'ve created and the artists who inspire me. Music has always been a passion, from producing my own tracks to discovering new sounds.',
    gaming: 'The games I\'m playing and the worlds I\'m exploring. Gaming isn\'t just a hobby—it\'s an art form, a story, and an experience.'
};

// Current category
let currentCategory = 'travel';

// ===================================
// CATEGORY NAVIGATION
// ===================================

function switchCategory(category) {
    currentCategory = category;
    
    // Update subtitle
    const subtitle = document.getElementById('categorySubtitle');
    subtitle.style.opacity = '0';
    setTimeout(() => {
        subtitle.textContent = CATEGORY_SUBTITLES[category];
        subtitle.style.opacity = '1';
    }, 150);
    
    // Update active button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    
    // Show active section
    document.querySelectorAll('.category-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${category}-section`).classList.add('active');
    
    // Load data for the category if not already loaded
    if (category === 'travel' && !travelDataLoaded) {
        loadTravelPhotos('all');
        travelDataLoaded = true;
    } else if (category === 'music' && !musicDataLoaded) {
        loadMySong();
        loadFavoriteArtists();
        musicDataLoaded = true;
    } else if (category === 'gaming' && !gamingDataLoaded) {
        loadGames();
        gamingDataLoaded = true;
    }
}

// Track what's been loaded
let travelDataLoaded = false;
let musicDataLoaded = false;
let gamingDataLoaded = false;

// Category button listeners
document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const category = this.getAttribute('data-category');
        switchCategory(category);
    });
});

// ===================================
// TRAVEL SECTION - Auto-load from Folders
// ===================================

let currentCountry = 'all';
let travelData = [];
let travelConfig = null;

async function loadTravelPhotos(country = 'all') {
    const grid = document.getElementById('travelGrid');
    grid.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Loading travel moments...</p></div>';
    
    try {
        // Load config if not already loaded
        if (!travelConfig) {
            const response = await fetch('data-travel.js');
            const scriptText = await response.text();
            
            // Extract travelConfig from the script
            const tempFunc = new Function(scriptText + '; return travelConfig;');
            travelConfig = tempFunc();
            
            if (!travelConfig || !travelConfig.destinations) {
                throw new Error('Invalid travel config');
            }
            
            console.log('Loaded destinations:', travelConfig.destinations.length);
            
            // Generate flag buttons from destinations
            generateFlagButtons();
        }
        
        // Build photo list from config
        const allPhotos = [];
        
        for (const destination of travelConfig.destinations) {
            const folderPath = `Assets/Images/Travel/${destination.folder}`;
            const photoCount = destination.photoCount || 0;
            
            for (let i = 1; i <= photoCount; i++) {
                allPhotos.push({
                    id: `${destination.folder}-${i}`,
                    image: `${folderPath}/${i}.webp`,
                    location: destination.location,
                    country: destination.country,
                    flag: destination.flag
                });
            }
        }
        
        console.log('Total photos:', allPhotos.length);
        
        travelData = allPhotos;
        displayTravelPhotos(country);
        
    } catch (error) {
        console.error('Error loading travel photos:', error);
        travelData = [];
        grid.innerHTML = `<div class="loading-state"><p>Error: ${error.message}<br>Check console for details.</p></div>`;
    }
}

// Generate flag navigation buttons from destinations
function generateFlagButtons() {
    const flagNav = document.getElementById('flagNavigation');
    
    const isWindows = navigator.platform.toLowerCase().includes('win');
    
    const countries = {};
    travelConfig.destinations.forEach(dest => {
        if (!countries[dest.country]) {
            countries[dest.country] = {
                name: dest.country.charAt(0).toUpperCase() + dest.country.slice(1),
                flag: dest.flag,
                code: dest.country.toUpperCase().substring(0, 2),
                countryCode: dest.country
            };
        }
    });
    
    let buttonsHTML = `
        <button class="flag-btn active" data-country="all">
            All
        </button>
    `;
    
    Object.values(countries).forEach(country => {
        const displayText = isWindows 
            ? country.name
            : `${country.flag} ${country.name}`;
        
        buttonsHTML += `
            <button class="flag-btn" data-country="${country.countryCode}">
                ${displayText}
            </button>
        `;
    });
    
    flagNav.innerHTML = buttonsHTML;
    
    flagNav.querySelectorAll('.flag-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            flagNav.querySelectorAll('.flag-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            this.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            const country = this.getAttribute('data-country');
            currentCountry = country;
            displayTravelPhotos(country);
        });
    });
}

function displayTravelPhotos(country) {
    const grid = document.getElementById('travelGrid');
    let filtered = country === 'all' 
        ? travelData 
        : travelData.filter(photo => photo.country === country);
    
    if (filtered.length === 0) {
        grid.innerHTML = '<div class="loading-state"><p>No photos for this location yet.</p></div>';
        return;
    }
    
    if (country === 'all') {
        filtered = shuffleArray([...filtered]);
    }
    
    grid.style.opacity = '0';
    
    grid.innerHTML = filtered.map(photo => `
        <div class="travel-card" data-country="${photo.country}">
            <img src="${photo.image}" alt="${photo.location}" loading="lazy">
            <div class="travel-card-location">
                <span class="flag">${photo.flag}</span>
                <span class="location-name">${photo.location}</span>
            </div>
        </div>
    `).join('');
    
    grid.querySelectorAll('.travel-card').forEach(card => {
        card.addEventListener('click', () => {
            const clickedCountry = card.getAttribute('data-country');
            
            document.querySelectorAll('.flag-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('data-country') === clickedCountry) {
                    btn.classList.add('active');
                    btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }
            });
            
            displayTravelPhotos(clickedCountry);
            
            document.getElementById('travel-section').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        });
    });
    
    layoutMasonry();
}

// Fisher-Yates shuffle with seed
function shuffleArray(array) {
    const shuffled = [...array];
    let seed = 12345;
    
    for (let i = shuffled.length - 1; i > 0; i--) {
        seed = (seed * 9301 + 49297) % 233280;
        const random = seed / 233280;
        const j = Math.floor(random * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
}

// Masonry layout
function layoutMasonry() {
    const grid = document.getElementById('travelGrid');
    const cards = Array.from(grid.querySelectorAll('.travel-card'));
    const gap = 20;
    
    const windowWidth = window.innerWidth;
    let columns;
    if (windowWidth > 1400) {
        columns = 4;
    } else if (windowWidth > 1024) {
        columns = 3;
    } else if (windowWidth > 768) {
        columns = 2;
    } else {
        columns = 1;
    }
    
    const imagePromises = cards.map(card => {
        const img = card.querySelector('img');
        return new Promise(resolve => {
            if (img.complete) resolve();
            else {
                img.onload = () => resolve();
                img.onerror = () => resolve();
            }
        });
    });
    
    Promise.all(imagePromises).then(() => {
        const gridWidth = grid.offsetWidth;
        const columnWidth = (gridWidth - (gap * (columns - 1))) / columns;
        const columnHeights = Array(columns).fill(0);
        
        let allSameAspect = true;
        let firstAspect = null;
        
        cards.forEach((card, index) => {
            const img = card.querySelector('img');
            const imgWidth = img.naturalWidth || img.width;
            const imgHeight = img.naturalHeight || img.height;
            
            if (!imgWidth || !imgHeight) return;
            
            const aspectRatio = imgHeight / imgWidth;
            
            if (firstAspect === null) {
                firstAspect = aspectRatio;
            } else if (Math.abs(aspectRatio - firstAspect) > 0.01) {
                allSameAspect = false;
            }
            
            let cardHeight = columnWidth * aspectRatio;
            
            if (allSameAspect && columns > 1) {
                const seed = (index * 7919) % 100;
                const variation = (seed / 100) * 0.3 - 0.15;
                cardHeight = cardHeight * (1 + variation);
            }
            
            const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));
            const left = shortestColumn * (columnWidth + gap);
            const top = columnHeights[shortestColumn];
            
            card.style.position = 'absolute';
            card.style.left = left + 'px';
            card.style.top = top + 'px';
            card.style.width = columnWidth + 'px';
            card.style.height = cardHeight + 'px';
            
            const cardImg = card.querySelector('img');
            if (cardImg) {
                cardImg.style.height = cardHeight + 'px';
                cardImg.style.objectFit = 'cover';
            }
            
            columnHeights[shortestColumn] += cardHeight + gap;
        });
        
        const maxHeight = Math.max(...columnHeights);
        grid.style.height = maxHeight + 'px';
        
        setTimeout(() => {
            grid.style.opacity = '1';
        }, 50);
    });
}

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (travelData.length > 0) {
            layoutMasonry();
        }
    }, 250);
});

// ===================================
// MUSIC SECTION - My Song with Hover Video Preview
// ===================================

async function loadMySong() {
    const container = document.getElementById('myMusicContainer');
    
    try {
        const response = await fetch('data-music.js');
        const scriptText = await response.text();
        
        const tempFunc = new Function(scriptText + '; return musicData;');
        const musicData = tempFunc();
        
        const song = musicData?.mySong;
        if (!song) throw new Error('No song data');

        // youtubeEmbedId should be just the video ID, e.g. 'd2nUN5jcyfE'
        const videoId = song.youtubeEmbedId;
        const isOnline = navigator.onLine;
        const canPreview = isOnline && videoId;

        container.innerHTML = `
            <div class="song-card" id="songCard">
                <div class="song-artwork" id="songArtwork">

                    <!-- Thumbnail / artwork image -->
                    <img 
                        id="songThumbnail"
                        src="${song.artwork}" 
                        alt="${song.title}"
                        onerror="this.src='https://i.ytimg.com/vi/${videoId}/hqdefault.jpg'"
                    >

                    <!-- Play icon overlay (shown at rest) -->
                    <div class="play-overlay" id="playOverlay">
                        <svg class="play-icon" viewBox="0 0 24 24" fill="white">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </div>

                    ${canPreview ? `
                    <!-- YouTube iframe (hidden until hover) -->
                    <iframe
                        id="youtubePreview"
                        src=""
                        frameborder="0"
                        allow="autoplay; encrypted-media"
                        allowfullscreen
                        tabindex="-1"
                    ></iframe>

                    <!-- "Now previewing" badge -->
                    <div class="preview-badge" id="previewBadge">
                        <span class="preview-dot"></span>
                        Preview
                    </div>
                    ` : ''}

                </div>
                <div class="song-info">
                    <h4 class="song-title">${song.title}</h4>
                    <p class="song-artist">${song.artist}</p>
                    <p class="song-producer">${song.producer}</p>
                </div>
            </div>
        `;

        const songCard   = document.getElementById('songCard');
        const thumbnail  = document.getElementById('songThumbnail');
        const playOverlay = document.getElementById('playOverlay');

        if (canPreview) {
            const iframe      = document.getElementById('youtubePreview');
            const badge       = document.getElementById('previewBadge');
            let hoverTimer    = null;
            let isPreviewActive = false;

            // Build the embed URL once
            // - autoplay=1  → starts playing immediately
            // - mute=1      → no audio (required for autoplay)
            // - controls=0  → hide player controls
            // - modestbranding=1 → minimal YouTube branding
            // - rel=0       → no related videos at the end
            // - iv_load_policy=3 → hide annotations
            // - playsinline=1 → plays inline on iOS
            const embedSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1&enablejsapi=1`;

            function showPreview() {
                isPreviewActive = true;
                iframe.src = embedSrc;

                // Fade thumbnail & play icon out
                thumbnail.style.opacity  = '0';
                playOverlay.style.opacity = '0';

                // Fade iframe & badge in
                iframe.style.opacity = '1';
                iframe.style.pointerEvents = 'none'; // keep clicks going to card
                badge.style.opacity  = '1';
            }

            function hidePreview() {
                isPreviewActive = false;

                // Stop video immediately by clearing src
                iframe.src = '';

                // Fade thumbnail & play icon back in
                thumbnail.style.opacity  = '1';
                playOverlay.style.opacity = '1';

                // Fade iframe & badge out
                iframe.style.opacity = '0';
                badge.style.opacity  = '0';
            }

            songCard.addEventListener('mouseenter', () => {
                // 400ms delay before preview starts — feels more intentional
                hoverTimer = setTimeout(showPreview, 400);
            });

            songCard.addEventListener('mouseleave', () => {
                clearTimeout(hoverTimer);
                if (isPreviewActive) hidePreview();
            });

            // Click opens full YouTube page
            songCard.addEventListener('click', () => {
                window.open(song.youtubeUrl, '_blank');
            });

        } else {
            // No preview available — just click to open
            songCard.addEventListener('click', () => {
                window.open(song.youtubeUrl, '_blank');
            });
        }

    } catch (error) {
        console.error('Error loading song:', error);
        container.innerHTML = `
            <div class="song-card" onclick="window.open('https://youtu.be/d2nUN5jcyfE', '_blank')">
                <div class="song-artwork">
                    <img src="https://i.ytimg.com/vi/d2nUN5jcyfE/hqdefault.jpg" alt="BRONX">
                    <div class="play-overlay">
                        <svg class="play-icon" viewBox="0 0 24 24" fill="white">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </div>
                </div>
                <div class="song-info">
                    <h4 class="song-title">BRONX</h4>
                    <p class="song-artist">Giovane Soldato feat. Cashmoneynobaby & K3Y</p>
                    <p class="song-producer">Produced by Francesco Gerbasio</p>
                </div>
            </div>
        `;
    }
}

// ===================================
// MUSIC SECTION - Favorite Artists
// ===================================

async function loadFavoriteArtists() {
    const grid = document.getElementById('artistsGrid');
    grid.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Loading artists...</p></div>';
    
    try {
        const response = await fetch('data-music.js');
        const scriptText = await response.text();
        
        const tempFunc = new Function(scriptText + '; return musicData;');
        const musicData = tempFunc();
        
        const artists = musicData?.artists || [];
        if (artists.length === 0) throw new Error('No artists data');
        
        grid.innerHTML = artists.map(artist => `
            <div class="artist-card">
                <div class="artist-image">
                    <img src="${artist.image}" alt="${artist.name}" onerror="this.src='https://via.placeholder.com/240x240?text=${encodeURIComponent(artist.name)}'">
                </div>
                <h4 class="artist-name">${artist.name}</h4>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading artists:', error);
        grid.innerHTML = `<div class="loading-state"><p>Add your favorite artists in data-music.js!</p></div>`;
    }
}

// ===================================
// GAMING SECTION
// ===================================

function loadGames() {
    const grid = document.getElementById('gamesGrid');
    
    const mockGames = [
        { title: 'Game Title 1', platform: 'PC, PlayStation 5',   cover: 'https://via.placeholder.com/250x333' },
        { title: 'Game Title 2', platform: 'Xbox Series X, PC',   cover: 'https://via.placeholder.com/250x333' },
        { title: 'Game Title 3', platform: 'Nintendo Switch',      cover: 'https://via.placeholder.com/250x333' }
    ];
    
    grid.innerHTML = mockGames.map(game => `
        <div class="game-card">
            <div class="game-image">
                <img src="${game.cover}" alt="${game.title}">
            </div>
            <div class="game-info">
                <h4 class="game-title">${game.title}</h4>
                <p class="game-platform">${game.platform}</p>
            </div>
        </div>
    `).join('');
}

// ===================================
// INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', function() {

    // Mobile hamburger menu
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileMenu   = document.getElementById('mobileMenu');
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
    
    // Navigation scroll effect
    const navigation = document.querySelector('.navigation');
    
    function handleScroll() {
        if (window.scrollY > 20) {
            navigation.classList.add('scrolled');
        } else {
            navigation.classList.remove('scrolled');
        }
    }
    
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    // Load travel section on init
    loadTravelPhotos('all');
    travelDataLoaded = true;
    
    document.getElementById('categorySubtitle').textContent = CATEGORY_SUBTITLES.travel;
});