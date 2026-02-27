// ===================================
// FUN PAGE - LOCAL DATA (NO APIs)
// ===================================

const CATEGORY_SUBTITLES = {
    travel: 'Places I\'ve been and stories from the road. Every journey tells a story, and these are mine captured through moments and memories.',
    music: 'Songs I\'ve created and the artists who inspire me. Music has always been a passion, from producing my own tracks to discovering new sounds.',
    gaming: 'The games I\'m playing and the worlds I\'m exploring. Gaming isn\'t just a hobby—it\'s an art form, a story, and an experience.'
};

let currentCategory = 'travel';

function switchCategory(category) {
    currentCategory = category;
    const subtitle = document.getElementById('categorySubtitle');
    subtitle.style.opacity = '0';
    setTimeout(() => {
        subtitle.textContent = CATEGORY_SUBTITLES[category];
        subtitle.style.opacity = '1';
    }, 150);
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    document.querySelectorAll('.category-section').forEach(s => s.classList.remove('active'));
    document.getElementById(`${category}-section`).classList.add('active');

    if (category === 'travel' && !travelDataLoaded) {
        loadTravelPhotos('all'); travelDataLoaded = true;
    } else if (category === 'music' && !musicDataLoaded) {
        loadMySong(); loadFavoriteArtists(); musicDataLoaded = true;
    } else if (category === 'gaming' && !gamingDataLoaded) {
        loadGames(); gamingDataLoaded = true;
    }
}

let travelDataLoaded = false;
let musicDataLoaded  = false;
let gamingDataLoaded = false;

document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        switchCategory(this.getAttribute('data-category'));
    });
});

// ===================================
// TRAVEL
// ===================================

let currentCountry = 'all';
let travelData = [];
let travelConfig = null;

async function loadTravelPhotos(country = 'all') {
    const grid = document.getElementById('travelGrid');
    grid.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Loading travel moments...</p></div>';
    try {
        if (!travelConfig) {
            const response = await fetch('data-travel.js');
            const scriptText = await response.text();
            const tempFunc = new Function(scriptText + '; return travelConfig;');
            travelConfig = tempFunc();
            if (!travelConfig || !travelConfig.destinations) throw new Error('Invalid travel config');
            generateFlagButtons();
        }
        const allPhotos = [];
        for (const destination of travelConfig.destinations) {
            const folderPath = `Assets/Images/Travel/${destination.folder}`;
            for (let i = 1; i <= (destination.photoCount || 0); i++) {
                allPhotos.push({
                    id: `${destination.folder}-${i}`,
                    image: `${folderPath}/${i}.webp`,
                    location: destination.location,
                    country: destination.country,
                    flag: destination.flag
                });
            }
        }
        travelData = allPhotos;
        displayTravelPhotos(country);
    } catch (error) {
        console.error('Error loading travel photos:', error);
        grid.innerHTML = `<div class="loading-state"><p>Error: ${error.message}</p></div>`;
    }
}

function generateFlagButtons() {
    const flagNav = document.getElementById('flagNavigation');
    const isWindows = navigator.platform.toLowerCase().includes('win');
    const countries = {};
    travelConfig.destinations.forEach(dest => {
        if (!countries[dest.country]) {
            countries[dest.country] = {
                name: dest.country.charAt(0).toUpperCase() + dest.country.slice(1),
                flag: dest.flag,
                countryCode: dest.country
            };
        }
    });

    let html = `<div class="flag-nav-pill" id="flagNavPill"></div>`;
    html += `<button class="flag-btn active" data-country="all">All</button>`;
    Object.values(countries).forEach(c => {
        const label = isWindows ? c.name : `${c.flag} ${c.name}`;
        html += `<button class="flag-btn" data-country="${c.countryCode}">${label}</button>`;
    });
    flagNav.innerHTML = html;

    const pill = document.getElementById('flagNavPill');

    function movePill(btn) {
        const navRect = flagNav.getBoundingClientRect();
        const btnRect = btn.getBoundingClientRect();
        const scrollLeft = flagNav.scrollLeft;
        pill.style.left  = (btnRect.left - navRect.left + scrollLeft) + 'px';
        pill.style.width = btnRect.width + 'px';
    }

    // Position pill on first active button after layout
    requestAnimationFrame(() => {
        const active = flagNav.querySelector('.flag-btn.active');
        if (active) movePill(active);
    });

    flagNav.querySelectorAll('.flag-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            flagNav.querySelectorAll('.flag-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            movePill(this);
            this.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            currentCountry = this.getAttribute('data-country');
            displayTravelPhotos(currentCountry);
        });
    });

    // Keep pill in sync when scrolling (for overflow containers)
    flagNav.addEventListener('scroll', () => {
        const active = flagNav.querySelector('.flag-btn.active');
        if (active) movePill(active);
    });
}

function displayTravelPhotos(country) {
    const grid = document.getElementById('travelGrid');
    let filtered = country === 'all' ? travelData : travelData.filter(p => p.country === country);
    if (filtered.length === 0) {
        grid.innerHTML = '<div class="loading-state"><p>No photos for this location yet.</p></div>';
        return;
    }
    if (country === 'all') filtered = shuffleArray([...filtered]);
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
            const c = card.getAttribute('data-country');
            const flagNav = document.getElementById('flagNavigation');
            const pill = document.getElementById('flagNavPill');
            document.querySelectorAll('.flag-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('data-country') === c) {
                    btn.classList.add('active');
                    btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    if (pill && flagNav) {
                        requestAnimationFrame(() => {
                            const navRect = flagNav.getBoundingClientRect();
                            const btnRect = btn.getBoundingClientRect();
                            pill.style.left  = (btnRect.left - navRect.left + flagNav.scrollLeft) + 'px';
                            pill.style.width = btnRect.width + 'px';
                        });
                    }
                }
            });
            displayTravelPhotos(c);
            document.getElementById('travel-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
    layoutMasonry();
}

function shuffleArray(array) {
    const shuffled = [...array];
    let seed = 12345;
    for (let i = shuffled.length - 1; i > 0; i--) {
        seed = (seed * 9301 + 49297) % 233280;
        const j = Math.floor((seed / 233280) * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function layoutMasonry() {
    const grid = document.getElementById('travelGrid');
    const cards = Array.from(grid.querySelectorAll('.travel-card'));
    const gap = 20;
    const w = window.innerWidth;
    const columns = w > 1400 ? 4 : w > 1024 ? 3 : w > 768 ? 2 : 1;
    const imagePromises = cards.map(card => {
        const img = card.querySelector('img');
        return new Promise(r => { if (img.complete) r(); else { img.onload = r; img.onerror = r; } });
    });
    Promise.all(imagePromises).then(() => {
        const gridWidth = grid.offsetWidth;
        const colW = (gridWidth - gap * (columns - 1)) / columns;
        const colHeights = Array(columns).fill(0);
        let allSame = true, firstAspect = null;
        cards.forEach((card, i) => {
            const img = card.querySelector('img');
            const iw = img.naturalWidth || img.width;
            const ih = img.naturalHeight || img.height;
            if (!iw || !ih) return;
            const ar = ih / iw;
            if (firstAspect === null) firstAspect = ar;
            else if (Math.abs(ar - firstAspect) > 0.01) allSame = false;
            let h = colW * ar;
            if (allSame && columns > 1) {
                const s = (i * 7919) % 100;
                h *= 1 + (s / 100) * 0.3 - 0.15;
            }
            const col = colHeights.indexOf(Math.min(...colHeights));
            card.style.cssText = `position:absolute;left:${col*(colW+gap)}px;top:${colHeights[col]}px;width:${colW}px;height:${h}px;`;
            const ci = card.querySelector('img');
            if (ci) { ci.style.height = h + 'px'; ci.style.objectFit = 'cover'; }
            colHeights[col] += h + gap;
        });
        grid.style.height = Math.max(...colHeights) + 'px';
        setTimeout(() => { grid.style.opacity = '1'; }, 50);
    });
}

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { if (travelData.length > 0) layoutMasonry(); }, 250);
});

// ===================================
// MUSIC — Apple-grade flipping card
// ===================================

async function loadMySong() {
    const container = document.getElementById('myMusicContainer');
    try {
        const response   = await fetch('data-music.js');
        const scriptText = await response.text();
        const tempFunc   = new Function(scriptText + '; return musicData;');
        const musicData  = tempFunc();
        const song = musicData?.mySong;
        if (!song) throw new Error('No song data');

        const videoId    = song.youtubeEmbedId;
        const isOnline   = navigator.onLine;
        const canPreview = isOnline && videoId;
        const artworkSrc = song.artwork || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

        container.innerHTML = `
            <div class="song-card" id="songCard">
                <div class="song-card-inner">

                    <div class="song-card-front">
                        <div class="song-card-artwork">
                            <img src="${artworkSrc}" alt="${song.title}"
                                 onerror="this.src='https://i.ytimg.com/vi/${videoId}/hqdefault.jpg'">
                        </div>
                        <div class="song-card-info">
                            <div class="song-card-waveform">
                                <span></span><span></span><span></span><span></span>
                            </div>
                            <div class="song-card-text">
                                <p class="song-card-title">${song.title}</p>
                                <p class="song-card-artist">${song.artist}</p>
                                <p class="song-card-producer">${song.producer}</p>
                            </div>
                            <div class="song-card-play-btn">
                                <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            </div>
                        </div>
                    </div>

                    <div class="song-card-back">
                        ${canPreview ? `
                            <iframe id="youtubePreview" src="" frameborder="0"
                                allow="autoplay; encrypted-media" allowfullscreen tabindex="-1">
                            </iframe>
                        ` : `
                            <img src="https://i.ytimg.com/vi/${videoId}/hqdefault.jpg"
                                 alt="${song.title}" style="width:100%;height:100%;object-fit:cover;">
                        `}
                        <div class="song-card-back-overlay">
                            <p class="song-card-back-title">${song.title}</p>
                            ${canPreview ? `
                                <div class="preview-badge">
                                    <span class="preview-dot"></span>Preview
                                </div>
                            ` : ''}
                        </div>
                    </div>

                </div>
            </div>
        `;

        const songCard   = document.getElementById('songCard');
        const artwork    = songCard.querySelector('.song-card-artwork');
        const infoBar    = songCard.querySelector('.song-card-info');

        let isFlipping = false;

        function flip() {
            if (isFlipping) return;
            isFlipping = true;
            songCard.classList.add('flipped');
            if (canPreview) {
                const iframe = document.getElementById('youtubePreview');
                setTimeout(() => { iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1`; }, 350);
            }
            // Unlock after transition completes
            setTimeout(() => { isFlipping = false; }, 700);
        }

        function unflip() {
            if (isFlipping) return;
            isFlipping = true;
            songCard.classList.remove('flipped');
            if (canPreview) {
                const iframe = document.getElementById('youtubePreview');
                iframe.src = '';
            }
            setTimeout(() => { isFlipping = false; }, 700);
        }

        // Only flip when entering the artwork — info bar is a safe zone
        artwork.addEventListener('mouseenter', flip);
        songCard.addEventListener('mouseleave', unflip);

        // Play button clicks open YouTube directly
        const playBtn = songCard.querySelector('.song-card-play-btn');
        if (playBtn) {
            playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                window.open(song.youtubeUrl, '_blank');
            });
        }

        songCard.addEventListener('click', () => window.open(song.youtubeUrl, '_blank'));

    } catch (error) {
        console.error('Error loading song:', error);
        container.innerHTML = `
            <div class="song-card" onclick="window.open('https://youtu.be/d2nUN5jcyfE','_blank')">
                <div class="song-card-inner">
                    <div class="song-card-front">
                        <div class="song-card-artwork">
                            <img src="https://i.ytimg.com/vi/d2nUN5jcyfE/hqdefault.jpg" alt="BRONX">
                        </div>
                        <div class="song-card-info">
                            <div class="song-card-waveform"><span></span><span></span><span></span><span></span></div>
                            <div class="song-card-text">
                                <p class="song-card-title">BRONX</p>
                                <p class="song-card-artist">Giovane Soldato feat. Cashmoneynobaby & K3Y</p>
                                <p class="song-card-producer">Produced by Francesco Gerbasio</p>
                            </div>
                            <div class="song-card-play-btn">
                                <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            </div>
                        </div>
                    </div>
                    <div class="song-card-back">
                        <img src="https://i.ytimg.com/vi/d2nUN5jcyfE/hqdefault.jpg" alt="BRONX"
                             style="width:100%;height:100%;object-fit:cover;">
                        <div class="song-card-back-overlay">
                            <p class="song-card-back-title">BRONX</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// ===================================
// MUSIC — Favorite Artists
// ===================================

async function loadFavoriteArtists() {
    const grid = document.getElementById('artistsGrid');
    grid.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Loading artists...</p></div>';

    try {
        const response   = await fetch('data-music.js');
        const scriptText = await response.text();
        const tempFunc   = new Function(scriptText + '; return musicData;');
        const musicData  = tempFunc();
        const artists    = musicData?.artists || [];
        if (artists.length === 0) throw new Error('No artists data');

        // Set src directly in template — simple and reliable
        grid.innerHTML = artists.map((artist, i) => `
            <div class="artist-card" data-index="${i}">
                <div class="artist-image">
                    ${artist.image
                        ? `<img src="${artist.image}" alt="${artist.name}" onerror="this.style.display='none'">`
                        : ''
                    }
                </div>
                <div class="artist-overlay"></div>
                <div class="artist-info">
                    <h4 class="artist-name">${artist.name}</h4>
                    <span class="artist-spotify-pill">Open in Spotify</span>
                </div>
            </div>
        `).join('');

        // Click opens Spotify search
        grid.querySelectorAll('.artist-card').forEach((card, i) => {
            card.addEventListener('click', () => {
                window.open(`https://open.spotify.com/search/${encodeURIComponent(artists[i].name)}`, '_blank');
            });
        });

    } catch (error) {
        console.error('Error loading artists:', error);
        grid.innerHTML = `<div class="loading-state"><p>Add your favorite artists in data-music.js!</p></div>`;
    }
}

// ===================================
// GAMING
// ===================================

// ===================================
// GAMING SECTION
// ===================================

async function loadGames() {
    const section = document.getElementById('gaming-section');
    try {
        const response  = await fetch('data-games.js');
        const scriptText = await response.text();
        const tempFunc  = new Function(scriptText + '; return gamesData;');
        const gamesData = tempFunc();

        section.innerHTML = `
            <!-- Featured Hero -->
            <div class="games-featured" id="gamesFeatured"></div>

            <!-- Currently Playing -->
            <div class="games-subsection">
                <h3 class="games-subsection-title">
                    <span class="games-subsection-dot playing"></span>
                    Currently Playing
                </h3>
                <div class="games-grid small" id="gamesPlaying"></div>
            </div>

            <!-- All-Time Favourites -->
            <div class="games-subsection">
                <h3 class="games-subsection-title">All‑Time Favourites</h3>
                <div class="games-grid" id="gamesFavourites"></div>
            </div>
        `;

        buildFeatured(gamesData.featured);
        buildGrid(document.getElementById('gamesPlaying'),    gamesData.currentlyPlaying);
        buildGrid(document.getElementById('gamesFavourites'), gamesData.favorites);

    } catch (err) {
        console.error('Error loading games:', err);
    }
}

// ── Featured carousel ──────────────────────────────────────
function buildFeatured(games) {
    const container = document.getElementById('gamesFeatured');
    let current = 0;
    let autoTimer;

    container.innerHTML = `
        <div class="gf-track" id="gfTrack">
            ${games.map((g, i) => `
                <div class="gf-slide ${i === 0 ? 'active' : ''}" data-index="${i}">
                    <div class="gf-bg">
                        <img src="${g.cover}" alt="${g.title}" class="gf-bg-img">
                        <div class="gf-bg-overlay"></div>
                    </div>
                    <div class="gf-content">
                        <span class="gf-genre">${g.genre}</span>
                        <h2 class="gf-title">${g.title}</h2>
                        <span class="gf-year">${g.year}</span>
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="gf-dots">
            ${games.map((_, i) => `
                <button class="gf-dot ${i === 0 ? 'active' : ''}" data-i="${i}"></button>
            `).join('')}
        </div>
        <button class="gf-arrow gf-prev" aria-label="Previous">‹</button>
        <button class="gf-arrow gf-next" aria-label="Next">›</button>
    `;

    const slides = container.querySelectorAll('.gf-slide');
    const dots   = container.querySelectorAll('.gf-dot');

    function goTo(n) {
        slides[current].classList.remove('active');
        dots[current].classList.remove('active');
        current = (n + games.length) % games.length;
        slides[current].classList.add('active');
        dots[current].classList.add('active');
    }

    function startAuto() { autoTimer = setInterval(() => goTo(current + 1), 5000); }
    function stopAuto()  { clearInterval(autoTimer); }

    container.querySelector('.gf-next').addEventListener('click', () => { stopAuto(); goTo(current + 1); startAuto(); });
    container.querySelector('.gf-prev').addEventListener('click', () => { stopAuto(); goTo(current - 1); startAuto(); });
    dots.forEach(d => d.addEventListener('click', () => { stopAuto(); goTo(+d.dataset.i); startAuto(); }));

    startAuto();
}

// ── Game grid ──────────────────────────────────────────────
function buildGrid(container, games) {
    container.innerHTML = games.map(g => {
        if (g.isSaga) {
            return `
                <div class="game-card saga-card" data-id="${g.id}">
                    <div class="game-cover">
                        <img src="${g.cover}" alt="${g.title}" loading="lazy">
                        <div class="game-cover-overlay"></div>
                        <div class="saga-badge">${g.games.length} games</div>
                    </div>
                    <div class="game-meta">
                        <span class="game-genre-tag">${g.genre}</span>
                        <h4 class="game-name">${g.title}</h4>
                    </div>
                    <div class="saga-drawer" id="drawer-${g.id}">
                        <ul class="saga-list">
                            ${g.games.map(entry => `
                                <li class="saga-list-item">
                                    <span class="saga-list-title">${entry.title}</span>
                                    <span class="saga-list-year">${entry.year}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            `;
        }
        return `
            <div class="game-card" data-id="${g.id}">
                <div class="game-cover">
                    <img src="${g.cover}" alt="${g.title}" loading="lazy">
                    <div class="game-cover-overlay"></div>
                </div>
                <div class="game-meta">
                    <span class="game-genre-tag">${g.genre}</span>
                    <h4 class="game-name">${g.title}</h4>
                </div>
            </div>
        `;
    }).join('');

    // Saga expand/collapse
    container.querySelectorAll('.saga-card').forEach(card => {
        card.addEventListener('click', () => {
            const isOpen = card.classList.contains('open');
            // Close all open sagas in this grid first
            container.querySelectorAll('.saga-card.open').forEach(c => c.classList.remove('open'));
            if (!isOpen) card.classList.add('open');
        });
    });
}

// ===================================
// INIT
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    const hamburgerBtn   = document.getElementById('hamburgerBtn');
    const mobileMenu     = document.getElementById('mobileMenu');
    const mobileNavLinks = document.querySelectorAll('.mobile-menu .nav-link');

    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });
    }
    document.addEventListener('click', function(e) {
        if (mobileMenu?.classList.contains('active')) {
            if (!mobileMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
                hamburgerBtn.classList.remove('active');
                mobileMenu.classList.remove('active');
            }
        }
    });
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburgerBtn.classList.remove('active');
            mobileMenu.classList.remove('active');
        });
    });

    const navigation = document.querySelector('.navigation');
    function handleScroll() {
        navigation.classList.toggle('scrolled', window.scrollY > 20);
    }
    window.addEventListener('scroll', handleScroll);
    handleScroll();

    loadTravelPhotos('all');
    travelDataLoaded = true;
    document.getElementById('categorySubtitle').textContent = CATEGORY_SUBTITLES.travel;
});