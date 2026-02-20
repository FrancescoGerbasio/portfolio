// Location Configuration
// Update this when you travel to a new city

const myLocation = {
    city: "Madrid",
    country: "Spain",
    // Coordinates for map centering (optional - will auto-fetch if not provided)
    lat: 40.4168,
    lon: -3.7038
};

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = myLocation;
}
