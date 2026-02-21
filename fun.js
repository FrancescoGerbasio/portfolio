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
        
        // Build photo list from config (no need to check if images exist)
        const allPhotos = [];
        
        for (const destination of travelConfig.destinations) {
            const folderPath = `Assets/Images/Travel/${destination.folder}`;
            const photoCount = destination.photoCount || 0;
            
            // Generate photo entries based on photoCount
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
    
    // Get unique countries
    const countries = {};
    travelConfig.destinations.forEach(dest => {
        if (!countries[dest.country]) {
            countries[dest.country] = {
                name: dest.country.charAt(0).toUpperCase() + dest.country.slice(1),
                flag: dest.flag,
                code: dest.country
            };
        }
    });
    
    // Build buttons HTML
    let buttonsHTML = `
        <button class="flag-btn active" data-country="all">
            🌍 All
        </button>
    `;
    
    Object.values(countries).forEach(country => {
        buttonsHTML += `
            <button class="flag-btn" data-country="${country.code}">
                ${country.flag} ${country.name}
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

function displayTravelPhotos(country) {
    const grid = document.getElementById('travelGrid');
    let filtered = country === 'all' 
        ? travelData 
        : travelData.filter(photo => photo.country === country);
    
    if (filtered.length === 0) {
        grid.innerHTML = '<div class="loading-state"><p>No photos for this location yet.</p></div>';
        return;
    }
    
    // Shuffle photos when "all" is selected for nice mixed layout
    if (country === 'all') {
        filtered = shuffleArray([...filtered]);
    }
    
    // Create cards with click-to-filter functionality
    grid.innerHTML = filtered.map(photo => `
        <div class="travel-card" data-country="${photo.country}">
            <img src="${photo.image}" alt="${photo.location}" loading="lazy">
            <div class="travel-card-location">
                <span class="flag">${photo.flag}</span>
                <span class="location-name">${photo.location}</span>
            </div>
        </div>
    `).join('');
    
    // Add click listeners to cards
    grid.querySelectorAll('.travel-card').forEach(card => {
        card.addEventListener('click', () => {
            const clickedCountry = card.getAttribute('data-country');
            
            // Update flag button active state
            document.querySelectorAll('.flag-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('data-country') === clickedCountry) {
                    btn.classList.add('active');
                    // Scroll the active flag button into view
                    btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }
            });
            
            // Filter photos by clicked country
            displayTravelPhotos(clickedCountry);
            
            // Smooth scroll to top of gallery
            document.getElementById('travel-section').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        });
    });
    
    // Apply masonry layout after images load
    layoutMasonry();
}

// Fisher-Yates shuffle algorithm (deterministic with seed)
function shuffleArray(array) {
    const shuffled = [...array];
    // Use a seed so shuffle is consistent across page loads
    let seed = 12345;
    
    for (let i = shuffled.length - 1; i > 0; i--) {
        // Seeded random
        seed = (seed * 9301 + 49297) % 233280;
        const random = seed / 233280;
        const j = Math.floor(random * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
}

// Masonry layout function - works in all browsers
function layoutMasonry() {
    const grid = document.getElementById('travelGrid');
    const cards = Array.from(grid.querySelectorAll('.travel-card'));
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
    
    // Wait for images to load
    const imagePromises = cards.map(card => {
        const img = card.querySelector('img');
        return new Promise(resolve => {
            if (img.complete) {
                resolve();
            } else {
                img.onload = () => resolve();
                img.onerror = () => resolve();
            }
        });
    });
    
    Promise.all(imagePromises).then(() => {
        // Calculate column width
        const gridWidth = grid.offsetWidth;
        const columnWidth = (gridWidth - (gap * (columns - 1))) / columns;
        
        // Track height of each column
        const columnHeights = Array(columns).fill(0);
        
        // Check if all images have same aspect ratio
        let allSameAspect = true;
        let firstAspect = null;
        
        cards.forEach((card, index) => {
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
                // Deterministic "random" based on index (consistent across refreshes)
                const seed = (index * 7919) % 100;
                const variation = (seed / 100) * 0.3 - 0.15; // -15% to +15%
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
            
            // Set image height to match card
            const cardImg = card.querySelector('img');
            if (cardImg) {
                cardImg.style.height = cardHeight + 'px';
                cardImg.style.objectFit = 'cover';
            }
            
            console.log(`Card ${index}: column ${shortestColumn}, top ${top.toFixed(0)}px, height ${cardHeight.toFixed(0)}px, aspect ${aspectRatio.toFixed(2)}`);
            
            // Update column height
            columnHeights[shortestColumn] += cardHeight + gap;
        });
        
        // Set grid height to tallest column
        const maxHeight = Math.max(...columnHeights);
        grid.style.height = maxHeight + 'px';
        
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
            layoutMasonry();
        }
    }, 250);
});

// ===================================
// MUSIC SECTION - Local Data
// ===================================

async function loadMySong() {
    const container = document.getElementById('myMusicContainer');
    
    try {
        // Load from local data file
        const response = await fetch('data-music.js');
        const scriptText = await response.text();
        
        // Extract musicData from the script
        const tempFunc = new Function(scriptText + '; return musicData;');
        const musicData = tempFunc();
        
        const song = musicData?.mySong;
        
        if (!song) throw new Error('No song data');
        
        container.innerHTML = `
            <div class="song-card" onclick="window.open('${song.youtubeUrl}', '_blank')">
                <div class="song-artwork">
                    <img src="${song.artwork}" alt="${song.title}">
                    <div class="play-overlay">
                        <svg class="play-icon" viewBox="0 0 24 24" fill="white">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </div>
                </div>
                <div class="song-info">
                    <h4 class="song-title">${song.title}</h4>
                    <p class="song-artist">${song.artist}</p>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading song:', error);
        // Fallback
        container.innerHTML = `
            <div class="song-card" onclick="window.open('https://youtu.be/N4ygYzmWhVk', '_blank')">
                <div class="song-artwork">
                    <img src="https://via.placeholder.com/300x300" alt="Your Song">
                    <div class="play-overlay">
                        <svg class="play-icon" viewBox="0 0 24 24" fill="white">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </div>
                </div>
                <div class="song-info">
                    <h4 class="song-title">Add your song!</h4>
                    <p class="song-artist">Francesco Gerbasio</p>
                </div>
            </div>
        `;
    }
}

// ===================================
// MUSIC SECTION - Spotify Artists
// ===================================

// ===================================
// MUSIC SECTION - Favorite Artists (Local Data)
// ===================================

async function loadFavoriteArtists() {
    const grid = document.getElementById('artistsGrid');
    grid.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Loading artists...</p></div>';
    
    try {
        // Load from local data file
        const response = await fetch('data-music.js');
        const scriptText = await response.text();
        
        // Extract musicData from the script
        const tempFunc = new Function(scriptText + '; return musicData;');
        const musicData = tempFunc();
        
        const artists = musicData?.artists || [];
        
        if (artists.length === 0) throw new Error('No artists data');
        
        // Render artist cards with hover popup
        grid.innerHTML = artists.map(artist => `
            <div class="artist-card">
                <div class="artist-image">
                    <img src="${artist.image}" alt="${artist.name}">
                </div>
                <h4 class="artist-name">${artist.name}</h4>
                
                ${artist.albums && artist.albums.length > 0 ? `
                    <!-- Albums popup on hover -->
                    <div class="artist-albums-popup">
                        <h5 class="popup-artist-name">${artist.name}</h5>
                        <div class="popup-albums-list">
                            ${artist.albums.map(album => `
                                <div class="album-item">
                                    <div class="album-cover">
                                        <img src="${album.cover}" alt="${album.name}">
                                    </div>
                                    <span class="album-name">${album.name}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading artists:', error);
        // Fallback
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
    
    // Mock games for now - will be replaced with your actual games
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
    
    // Close menu when clicking a link
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
    let lastScrollY = 0;
    
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
    
    // Load only travel section initially (others load on demand)
    loadTravelPhotos('all');
    travelDataLoaded = true;
    
    // Set initial subtitle
    document.getElementById('categorySubtitle').textContent = CATEGORY_SUBTITLES.travel;
});