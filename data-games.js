const gamesData = {

    featured: [
        { id: 'ac-brotherhood', title: "Assassin's Creed Black Flag", cover: 'Assets/Images/Games/ac-black-flag.webp', genre: 'Action RPG', year: '2013' },
        { id: 'godfather',      title: 'The Godfather',                cover: 'Assets/Images/Games/godfather.webp',      genre: 'Action',     year: '2006' },
        { id: 'halo4',          title: 'Halo IV',                       cover: 'Assets/Images/Games/halo4.webp',          genre: 'FPS',         year: '2012' },
        { id: 'witcher3',       title: 'The Witcher III',                cover: 'Assets/Images/Games/witcher3.webp',       genre: 'RPG',         year: '2015' },
        { id: 'skyrim',         title: 'The Elder Scrolls V: Skyrim',  cover: 'Assets/Images/Games/skyrim.webp',         genre: 'RPG',         year: '2011' },
        { id: 'destiny2',       title: 'Destiny II',                    cover: 'Assets/Images/Games/destiny2.webp',       genre: 'FPS / MMO',   year: '2017' },
    ],

    currentlyPlaying: [
        { id: 'stray',      title: 'Stray',               cover: 'Assets/Images/Games/stray.webp',      genre: 'Adventure' },
        { id: 'pokemon-za', title: 'Pokémon Legends: Z-A', cover: 'Assets/Images/Games/pokemon-za.webp', genre: 'RPG'       },
    ],

    favorites: [
        {
            id: 'ac-saga',
            title: "Assassin's Creed",
            cover: 'Assets/Images/Games/ac-saga.webp',
            genre: 'Action RPG',
            isSaga: true,
            games: [
                { title: "Assassin's Creed",              year: '2007' },
                { title: "Assassin's Creed II",           year: '2009' },
                { title: "AC: Brotherhood",               year: '2010' },
                { title: "AC: Revelations",               year: '2011' },
                { title: "AC III",                        year: '2012' },
                { title: "AC IV: Black Flag",             year: '2013' },
                { title: "AC: Rogue",                     year: '2014' },
                { title: "AC: Unity",                     year: '2014' },
                { title: "AC: Syndicate",                 year: '2015' },
                { title: "AC: Origins",                   year: '2017' },
                { title: "AC: Odyssey",                   year: '2018' },
                { title: "AC: Valhalla",                  year: '2020' },
                { title: "AC: Mirage",                    year: '2023' },
                { title: "AC: Shadows",                   year: '2025' },
            ]
        },
        {
            id: 'oblivion',
            title: 'Oblivion',
            cover: 'Assets/Images/Games/oblivion.webp',
            genre: 'RPG',
            isSaga: false,
        },
        {
            id: 'rac-saga',
            title: 'Ratchet & Clank',
            cover: 'Assets/Images/Games/rac-saga.webp',
            genre: 'Platformer',
            isSaga: true,
            games: [
                { title: 'Ratchet & Clank',                        year: '2002' },
                { title: 'Going Commando',                         year: '2003' },
                { title: 'Up Your Arsenal',                        year: '2004' },
                { title: 'Deadlocked',                             year: '2005' },
                { title: 'Size Matters',                           year: '2007' },
                { title: 'Tools of Destruction',                   year: '2007' },
                { title: 'Quest for Booty',                        year: '2008' },
                { title: 'A Crack in Time',                        year: '2009' },
                { title: 'All 4 One',                              year: '2011' },
                { title: 'Full Frontal Assault',                   year: '2012' },
                { title: 'Into the Nexus',                         year: '2013' },
                { title: 'Ratchet & Clank (Reboot)',               year: '2016' },
                { title: 'Rift Apart',                             year: '2021' },
            ]
        },
        {
            id: 'nfs-saga',
            title: 'Need for Speed',
            cover: 'Assets/Images/Games/nfs-saga.webp',
            genre: 'Racing',
            isSaga: true,
            games: [
                { title: 'Underground 2',    year: '2004' },
                { title: 'Most Wanted',      year: '2005' },
                { title: 'Carbon',           year: '2006' },
                { title: 'ProStreet',        year: '2007' },
                { title: 'Undercover',       year: '2008' },
                { title: 'Shift',            year: '2009' },
                { title: 'Hot Pursuit',      year: '2010' },
                { title: 'Shift 2 Unleashed',year: '2011' },
                { title: 'The Run',          year: '2011' },
                { title: 'Rivals',           year: '2013' },
                { title: 'Heat',             year: '2019' },
                { title: 'Unbound',          year: '2022' },
            ]
        },
        {
            id: 'f1-games',
            title: 'F1 Series',
            cover: 'Assets/Images/Games/f1-games.webp',
            genre: 'Racing',
            isSaga: true,
            games: [
                { title: 'F1 2019', year: '2019' },
                { title: 'F1 2022', year: '2022' },
            ]
        },
    ]
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = gamesData;
}