// SIMPLE TEST - Copy this and paste in browser console (F12)
// This will show you what's happening

console.log('=== DEBUGGING TRAVEL PHOTOS ===');

// Test 1: Check if data-travel.js loads
fetch('data-travel.js')
    .then(response => response.text())
    .then(text => {
        console.log('✓ data-travel.js loaded');
        eval(text);
        console.log('✓ Config loaded:', travelConfig);
        console.log('✓ Number of destinations:', travelConfig.destinations.length);
        
        // Test 2: Check folder structure
        travelConfig.destinations.forEach(dest => {
            console.log(`Checking: ${dest.location} (${dest.folder})`);
            
            // Try to load first image
            const img = new Image();
            img.onload = () => {
                console.log(`  ✓ Found: Assets/Images/Travel/${dest.folder}/1.webp`);
            };
            img.onerror = () => {
                console.log(`  ✗ Missing: Assets/Images/Travel/${dest.folder}/1.webp`);
            };
            img.src = `Assets/Images/Travel/${dest.folder}/1.webp`;
        });
    })
    .catch(error => {
        console.error('✗ Failed to load data-travel.js:', error);
    });

// Test 3: Check if images exist
console.log('\n=== Testing Croatia specifically ===');
const testImg = new Image();
testImg.onload = () => console.log('✓ Croatia/1.webp EXISTS!');
testImg.onerror = () => console.log('✗ Croatia/1.webp NOT FOUND');
testImg.src = 'Assets/Images/Travel/Croatia/1.webp';

console.log('\nRun this test and tell me what you see!');
