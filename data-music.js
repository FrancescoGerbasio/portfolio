// data/music.json
// Your song and favorite artists

const musicData = {
    // Your music production
    mySong: {
        title: 'BRONX',
        artist: 'Giovane Soldato feat. Cashmoneynobaby & K3Y',
        producer: 'Produced by Francesco Gerbasio',
        artwork: 'Assets/Images/Music/Bronx.webp',
        youtubeUrl: 'https://youtu.be/d2nUN5jcyfE?si=RycWPCsKHkMKrIsQ',
        youtubeEmbedId: 'd2nUN5jcyfE'  // ← Just the video ID, not the full URL
    },
    
    // Favorite Artists
    artists: [
        // Italian Artists
        {
            id: 'lazza',
            name: 'Lazza',
            image: 'Assets/Images/Artists/lazza.jpg',
            albums: [
                { name: 'Sirio', cover: 'Assets/Images/Albums/lazza-sirio.jpg' },
                { name: 'Re Mida', cover: 'Assets/Images/Albums/lazza-remida.jpg' },
                { name: 'J', cover: 'Assets/Images/Albums/lazza-j.jpg' }
            ]
        },
        {
            id: 'sfera-ebbasta',
            name: 'Sfera Ebbasta',
            image: 'Assets/Images/Artists/sfera-ebbasta.jpg',
            albums: [
                { name: 'Famoso', cover: 'Assets/Images/Albums/sfera-famoso.jpg' },
                { name: 'XDVR', cover: 'Assets/Images/Albums/sfera-xdvr.jpg' }
            ]
        },
        {
            id: 'flaco-g',
            name: 'Flaco G',
            image: 'Assets/Images/Artists/flaco-g.jpg',
            albums: [
                { name: 'Album 1', cover: 'Assets/Images/Albums/flaco-album1.jpg' }
            ]
        },
        {
            id: 'izi',
            name: 'Izi',
            image: 'Assets/Images/Artists/izi.jpg',
            albums: [
                { name: 'Fenice', cover: 'Assets/Images/Albums/izi-fenice.jpg' }
            ]
        },
        {
            id: 'niky-savage',
            name: 'Niky Savage',
            image: 'Assets/Images/Artists/niky-savage.jpg',
            albums: []
        },
        {
            id: 'kid-yugi',
            name: 'Kid Yugi',
            image: 'Assets/Images/Artists/kid-yugi.jpg',
            albums: []
        },
        {
            id: 'papa-v',
            name: 'Papa V',
            image: 'Assets/Images/Artists/papa-v.jpg',
            albums: []
        },
        {
            id: 'nerissima-serpe',
            name: 'Nerissima Serpe',
            image: 'Assets/Images/Artists/nerissima-serpe.jpg',
            albums: []
        },
        {
            id: 'rrari-dal-tacco',
            name: 'RRARI DAL TACCO',
            image: 'Assets/Images/Artists/rrari-dal-tacco.jpg',
            albums: []
        },
        
        // Hispanic Artists
        {
            id: 'bad-bunny',
            name: 'Bad Bunny',
            image: 'Assets/Images/Artists/bad-bunny.jpg',
            albums: [
                { name: 'Un Verano Sin Ti', cover: 'Assets/Images/Albums/bb-verano.jpg' },
                { name: 'Nadie Sabe Lo Que Va a Pasar Mañana', cover: 'Assets/Images/Albums/bb-nadie.jpg' }
            ]
        },
        {
            id: 'j-balvin',
            name: 'J Balvin',
            image: 'Assets/Images/Artists/j-balvin.jpg',
            albums: [
                { name: 'Jose', cover: 'Assets/Images/Albums/jbalvin-jose.jpg' }
            ]
        },
        {
            id: 'arcangel',
            name: 'Arcángel',
            image: 'Assets/Images/Artists/arcangel.jpg',
            albums: []
        },
        {
            id: 'young-miko',
            name: 'Young Miko',
            image: 'Assets/Images/Artists/young-miko.jpg',
            albums: []
        },
        {
            id: 'guaynaa',
            name: 'Guaynaa',
            image: 'Assets/Images/Artists/guaynaa.jpg',
            albums: []
        },
        {
            id: 'jhayco',
            name: 'Jhayco',
            image: 'Assets/Images/Artists/jhayco.jpg',
            albums: []
        },
        {
            id: 'rauw-alejandro',
            name: 'Rauw Alejandro',
            image: 'Assets/Images/Artists/rauw-alejandro.jpg',
            albums: [
                { name: 'Saturno', cover: 'Assets/Images/Albums/rauw-saturno.jpg' }
            ]
        },
        {
            id: 'lyanno',
            name: 'Lyanno',
            image: 'Assets/Images/Artists/lyanno.jpg',
            albums: []
        },
        {
            id: 'quevedo',
            name: 'Quevedo',
            image: 'Assets/Images/Artists/quevedo.jpg',
            albums: []
        },
        {
            id: 'lucho-rk',
            name: 'Lucho RK',
            image: 'Assets/Images/Artists/lucho-rk.jpg',
            albums: []
        }
    ]
};

// Export for use in fun.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = musicData;
}