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
    
    // Detect Windows (emoji support is poor)
    const isWindows = navigator.platform.toLowerCase().includes('win');
    
    // Get unique countries
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
    
    // Build buttons HTML
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
    
    // Re-attach click listeners
    flagNav.querySelectorAll('.flag-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active state
            flagNav.querySelectorAll('.flag-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Scroll button into view (centered)
            this.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            
            // Load photos for selected country
            const country = this.getAttribute('data-country');
            currentCountry = country;
            displayTravelPhotos(country);
        });
    });
}

function isMobile() {
    return window.innerWidth <= 768;
}

function displayTravelPhotos(country) {
    if (isMobile()) {
        displayTravelPhotosMobile(country);
    } else {
        displayTravelPhotosDesktop(country);
    }
}

// ===================================
// MOBILE TRAVEL LAYOUT
// "All" → grouped destination carousels (Apple Photos style)
// Filtered → tight 2-column grid
// ===================================

function displayTravelPhotosMobile(country) {
    const grid = document.getElementById('travelGrid');

    // Reset
    grid.style.opacity = '0';
    grid.style.height = '';
    grid.innerHTML = '';
    grid.classList.add('mobile-layout');

    if (country === 'all') {
        // ── Grouped carousels by destination ──
        // Order by config order (not shuffled — destinations feel like chapters)
        const groups = [];
        travelConfig.destinations.forEach(dest => {
            const photos = travelData.filter(p => p.location === dest.location);
            if (photos.length > 0) groups.push({ dest, photos });
        });

        grid.innerHTML = groups.map((g, gi) => `
            <div class="mobile-destination-group" data-group-index="${gi}">
                <div class="mobile-dest-header">
                    <span class="mobile-dest-flag">${g.dest.flag}</span>
                    <span class="mobile-dest-name">${g.dest.location}</span>
                    <span class="mobile-dest-count">${g.photos.length}</span>
                </div>
                <div class="mobile-carousel" data-country="${g.dest.country}">
                    ${g.photos.map((photo, pi) => `
                        <div class="mobile-carousel-card" style="--i:${pi}" data-country="${photo.country}">
                            <img src="${photo.image}" alt="${photo.location}" loading="lazy">
                        </div>
                    `).join('')}
                </div>
                <button class="mobile-see-all-btn" data-country="${g.dest.country}" data-name="${g.dest.location}" data-flag="${g.dest.flag}">
                    See all ${g.photos.length} photos
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                </button>
            </div>
        `).join('');

        // "See all" button → filter to that country
        grid.querySelectorAll('.mobile-see-all-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const c = btn.getAttribute('data-country');
                currentCountry = c;
                syncFlagButtons(c);
                displayTravelPhotosMobile(c);
            });
        });

        // Stagger group entrance
        requestAnimationFrame(() => {
            grid.style.opacity = '1';
            grid.querySelectorAll('.mobile-destination-group').forEach((group, i) => {
                group.style.animationDelay = `${i * 60}ms`;
                group.classList.add('group-enter');
            });
        });

    } else {
        // ── Filtered: 2-column photo grid ──
        const filtered = travelData.filter(p => p.country === country);
        const dest = travelConfig.destinations.find(d => d.country === country);

        if (filtered.length === 0) {
            grid.innerHTML = '<div class="loading-state"><p>No photos yet.</p></div>';
            grid.style.opacity = '1';
            return;
        }

        grid.innerHTML = `
            <div class="mobile-filter-header">
                <button class="mobile-back-btn" id="mobileBackBtn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                    All places
                </button>
                <span class="mobile-filter-label">${dest ? dest.flag : ''} ${dest ? dest.location : country}</span>
            </div>
            <div class="mobile-two-col-grid">
                ${filtered.map((photo, i) => `
                    <div class="mobile-grid-card" style="--i:${i}" data-country="${photo.country}">
                        <img src="${photo.image}" alt="${photo.location}" loading="lazy">
                    </div>
                `).join('')}
            </div>
        `;

        // Back button
        document.getElementById('mobileBackBtn').addEventListener('click', () => {
            currentCountry = 'all';
            syncFlagButtons('all');
            displayTravelPhotosMobile('all');
        });

        // Stagger cards
        requestAnimationFrame(() => {
            grid.style.opacity = '1';
            grid.querySelectorAll('.mobile-grid-card').forEach((card, i) => {
                card.style.animationDelay = `${Math.min(i * 30, 300)}ms`;
                card.classList.add('card-enter');
            });
        });
    }
}

function syncFlagButtons(country) {
    document.querySelectorAll('.flag-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-country') === country) {
            btn.classList.add('active');
            btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    });
}

// ===================================
// DESKTOP TRAVEL LAYOUT (unchanged)
// ===================================

function displayTravelPhotosDesktop(country) {
    const grid = document.getElementById('travelGrid');
    grid.classList.remove('mobile-layout');

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
    grid.style.height = '';
    grid.innerHTML = '';

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
            
            if (currentCountry === clickedCountry) {
                currentCountry = 'all';
                syncFlagButtons('all');
                displayTravelPhotosDesktop('all');
                return;
            }

            currentCountry = clickedCountry;
            syncFlagButtons(clickedCountry);
            displayTravelPhotosDesktop(clickedCountry);
        });
    });
    
    requestAnimationFrame(() => {
        layoutMasonry();
    });
}

// Fisher-Yates shuffle algorithm (deterministic with seed)
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

// Masonry layout function
function layoutMasonry() {
    const grid = document.getElementById('travelGrid');
    const cards = Array.from(grid.querySelectorAll('.travel-card'));

    if (cards.length === 0) return;

    const gap = 20;
    
    // Responsive column count
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
    
    console.log('Masonry layout:', columns, 'columns for width', windowWidth);
    
    // *** FIX: Reset all card positions before recalculating ***
    cards.forEach(card => {
        card.style.position = '';
        card.style.left = '';
        card.style.top = '';
        card.style.width = '';
        card.style.height = '';
        const img = card.querySelector('img');
        if (img) {
            img.style.height = '';
            img.style.objectFit = '';
        }
    });

    // Wait for images to load
    const imagePromises = cards.map(card => {
        const img = card.querySelector('img');
        return new Promise(resolve => {
            if (img.complete && img.naturalWidth > 0) {
                resolve();
            } else {
                img.onload = () => resolve();
                img.onerror = () => resolve();
            }
        });
    });
    
    Promise.all(imagePromises).then(() => {
        // *** FIX: Re-query cards after promises resolve (DOM may have changed) ***
        const freshCards = Array.from(grid.querySelectorAll('.travel-card'));
        if (freshCards.length === 0) return;

        // Calculate column width
        const gridWidth = grid.offsetWidth;
        const columnWidth = (gridWidth - (gap * (columns - 1))) / columns;
        
        // Track height of each column
        const columnHeights = Array(columns).fill(0);
        
        // Check if all images have same aspect ratio
        let allSameAspect = true;
        let firstAspect = null;
        
        freshCards.forEach((card, index) => {
            const img = card.querySelector('img');
            const imgWidth = img.naturalWidth || img.width;
            const imgHeight = img.naturalHeight || img.height;
            
            if (!imgWidth || !imgHeight) {
                console.warn('Image dimensions not available for card', index);
                return;
            }
            
            const aspectRatio = imgHeight / imgWidth;
            
            if (firstAspect === null) {
                firstAspect = aspectRatio;
            } else if (Math.abs(aspectRatio - firstAspect) > 0.01) {
                allSameAspect = false;
            }
            
            let cardHeight = columnWidth * aspectRatio;
            
            // If all same aspect, add random variation for visual interest
            if (allSameAspect && columns > 1) {
                const seed = (index * 7919) % 100;
                const variation = (seed / 100) * 0.3 - 0.15;
                cardHeight = cardHeight * (1 + variation);
            }
            
            // Find shortest column
            const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));
            
            // Position card
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
            
            // Update column height
            columnHeights[shortestColumn] += cardHeight + gap;
        });
        
        // Set grid height to tallest column
        const maxHeight = Math.max(...columnHeights);
        grid.style.height = maxHeight + 'px';
        
        // Fade in grid after layout is complete
        setTimeout(() => {
            grid.style.opacity = '1';
        }, 50);
        
        console.log('Column heights:', columnHeights.map(h => h.toFixed(0)));
        console.log('All same aspect ratio:', allSameAspect);
    });
}

// Re-layout on window resize
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (travelData.length > 0) {
            displayTravelPhotos(currentCountry);
        }
    }, 250);
});

// ===================================
// MUSIC SECTION - Local Data
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
        
        const isOnline = navigator.onLine;
        
        container.innerHTML = `
            <div class="song-card" id="songCard" data-youtube-id="${song.youtubeEmbedId || ''}" data-online="${isOnline}">
                <div class="song-artwork" id="songArtwork">
                    <img src="${song.artwork}" alt="${song.title}" onerror="this.src='https://via.placeholder.com/500x500?text=BRONX'">
                    <div class="play-overlay">
                        <svg class="play-icon" viewBox="0 0 24 24" fill="white">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </div>
                    ${isOnline ? `
                        <iframe 
                            id="youtubePreview"
                            style="display:none; position:absolute; top:0; left:0; width:100%; height:100%;"
                            src=""
                            frameborder="0"
                            allow="autoplay; encrypted-media"
                            allowfullscreen>
                        </iframe>
                    ` : ''}
                </div>
                <div class="song-info">
                    <h4 class="song-title">${song.title}</h4>
                    <p class="song-artist">${song.artist}</p>
                    <p class="song-producer">${song.producer}</p>
                </div>
            </div>
        `;
        
        if (isOnline && song.youtubeEmbedId) {
            const songCard = document.getElementById('songCard');
            const artwork = document.getElementById('songArtwork');
            const iframe = document.getElementById('youtubePreview');
            
            let hoverTimeout;
            
            songCard.addEventListener('mouseenter', () => {
                hoverTimeout = setTimeout(() => {
                    if (iframe) {
                        iframe.src = `https://www.youtube.com/embed/${song.youtubeEmbedId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0`;
                        artwork.querySelector('img').style.opacity = '0';
                        artwork.querySelector('.play-overlay').style.opacity = '0';
                        iframe.style.display = 'block';
                    }
                }, 500);
            });
            
            songCard.addEventListener('mouseleave', () => {
                clearTimeout(hoverTimeout);
                if (iframe) {
                    iframe.style.display = 'none';
                    iframe.src = '';
                    artwork.querySelector('img').style.opacity = '1';
                    artwork.querySelector('.play-overlay').style.opacity = '1';
                }
            });
            
            songCard.addEventListener('click', () => {
                window.open(song.youtubeUrl, '_blank');
            });
        } else {
            const songCard = document.getElementById('songCard');
            songCard.addEventListener('click', () => {
                window.open(song.youtubeUrl, '_blank');
            });
        }
        
    } catch (error) {
        console.error('Error loading song:', error);
        container.innerHTML = `
            <div class="song-card" onclick="window.open('https://youtu.be/N4ygYzmWhVk', '_blank')">
                <div class="song-artwork">
                    <img src="https://via.placeholder.com/500x500?text=BRONX" alt="BRONX">
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
// MUSIC SECTION - Favorite Artists (Local Data)
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
        grid.innerHTML = `
            <div class="loading-state">
                <p>Add your favorite artists in data-music.js!</p>
            </div>
        `;
    }
}

// ===================================
// GAMING SECTION
// ===================================

function loadGames() {
    const grid = document.getElementById('gamesGrid');
    
    const mockGames = [
        {
            title: 'Game Title 1',
            platform: 'PC, PlayStation 5',
            cover: 'https://via.placeholder.com/250x333'
        },
        {
            title: 'Game Title 2',
            platform: 'Xbox Series X, PC',
            cover: 'https://via.placeholder.com/250x333'
        },
        {
            title: 'Game Title 3',
            platform: 'Nintendo Switch',
            cover: 'https://via.placeholder.com/250x333'
        }
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
    // ===================================
    // MOBILE HAMBURGER MENU
    // ===================================
    
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
    
    // ===================================
    // NAVIGATION SCROLL EFFECT
    // ===================================
    
    const navigation = document.querySelector('.navigation');
    
    function handleScroll() {
        const currentScrollY = window.scrollY;
        if (currentScrollY > 20) {
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
    
    // Set initial subtitle
    document.getElementById('categorySubtitle').textContent = CATEGORY_SUBTITLES.travel;
});