// data-games.js
// Gaming section data

const gamesData = {

    featured: [
        {
            id: 'ac-brotherhood',
            title: "Assassin's Creed Brotherhood",
            cover: 'Assets/Images/Games/ac-brotherhood.webp',
            genre: 'Action RPG',
            year: '2010',
        },
        {
            id: 'godfather',
            title: 'The Godfather',
            cover: 'Assets/Images/Games/godfather.webp',
            genre: 'Action',
            year: '2006',
        },
        {
            id: 'halo4',
            title: 'Halo 4',
            cover: 'Assets/Images/Games/halo4.webp',
            genre: 'FPS',
            year: '2012',
        },
        {
            id: 'witcher3',
            title: 'The Witcher 3',
            cover: 'Assets/Images/Games/witcher3.webp',
            genre: 'RPG',
            year: '2015',
        },
        {
            id: 'skyrim',
            title: 'The Elder Scrolls V: Skyrim',
            cover: 'Assets/Images/Games/skyrim.webp',
            genre: 'RPG',
            year: '2011',
        }
    ],

    favorites: [
        { id: 'ac-saga',    title: "Assassin's Creed Saga", cover: 'Assets/Images/Games/ac-saga.webp',    genre: 'Action RPG' },
        { id: 'oblivion',   title: 'Oblivion',              cover: 'Assets/Images/Games/oblivion.webp',   genre: 'RPG'        },
        { id: 'rac-saga',   title: 'Ratchet & Clank Saga',  cover: 'Assets/Images/Games/rac-saga.webp',   genre: 'Platformer' },
        { id: 'nfs-saga',   title: 'Need for Speed Saga',   cover: 'Assets/Images/Games/nfs-saga.webp',   genre: 'Racing'     },
        { id: 'f1-games',   title: 'F1 Games',              cover: 'Assets/Images/Games/f1-games.webp',   genre: 'Racing'     },
    ],

    currentlyPlaying: [
        { id: 'stray',      title: 'Stray',                 cover: 'Assets/Images/Games/stray.webp',      genre: 'Adventure'  },
        { id: 'pokemon-za', title: 'Pokémon Legends: Z-A',  cover: 'Assets/Images/Games/pokemon-za.webp', genre: 'RPG'        },
    ]
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = gamesData;
}
