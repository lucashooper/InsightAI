/**
 * Icon Generation Script
 * 
 * This script helps you create PWA icons from your existing logo.
 * 
 * OPTION 1: Use Online Tool (Easiest)
 * 1. Go to https://realfavicongenerator.net/
 * 2. Upload public/Insight-logo.png
 * 3. Download generated icons
 * 4. Place in public/ folder
 * 
 * OPTION 2: Use ImageMagick (Command Line)
 * Install ImageMagick: https://imagemagick.org/script/download.php
 * Then run these commands:
 * 
 * magick public/Insight-logo.png -resize 192x192 public/icon-192.png
 * magick public/Insight-logo.png -resize 512x512 public/icon-512.png
 * magick public/Insight-logo.png -resize 32x32 public/favicon.ico
 * magick public/Insight-logo.png -resize 180x180 public/apple-touch-icon.png
 * 
 * OPTION 3: Use Sharp (Node.js)
 * npm install sharp
 * Then uncomment and run the code below:
 */

// Uncomment to use Sharp for icon generation:
/*
const sharp = require('sharp');
const fs = require('fs');

async function generateIcons() {
  const inputPath = './public/Insight-logo.png';
  
  if (!fs.existsSync(inputPath)) {
    console.error('❌ Error: public/Insight-logo.png not found!');
    console.log('Please ensure your logo exists at public/Insight-logo.png');
    return;
  }

  console.log('🎨 Generating PWA icons...\n');

  try {
    // Generate 192x192 icon
    await sharp(inputPath)
      .resize(192, 192, { fit: 'contain', background: { r: 10, g: 10, b: 10, alpha: 1 } })
      .png()
      .toFile('./public/icon-192.png');
    console.log('✅ Created icon-192.png');

    // Generate 512x512 icon
    await sharp(inputPath)
      .resize(512, 512, { fit: 'contain', background: { r: 10, g: 10, b: 10, alpha: 1 } })
      .png()
      .toFile('./public/icon-512.png');
    console.log('✅ Created icon-512.png');

    // Generate favicon
    await sharp(inputPath)
      .resize(32, 32, { fit: 'contain', background: { r: 10, g: 10, b: 10, alpha: 1 } })
      .png()
      .toFile('./public/favicon.ico');
    console.log('✅ Created favicon.ico');

    // Generate Apple touch icon
    await sharp(inputPath)
      .resize(180, 180, { fit: 'contain', background: { r: 10, g: 10, b: 10, alpha: 1 } })
      .png()
      .toFile('./public/apple-touch-icon.png');
    console.log('✅ Created apple-touch-icon.png');

    console.log('\n🎉 All icons generated successfully!');
    console.log('\nNext steps:');
    console.log('1. Check the icons in the public/ folder');
    console.log('2. Run: npm run build');
    console.log('3. Deploy your app');
    console.log('4. Test on mobile devices');
  } catch (error) {
    console.error('❌ Error generating icons:', error);
  }
}

generateIcons();
*/

console.log('📱 PWA Icon Generation Guide\n');
console.log('Choose one of these methods to create your icons:\n');
console.log('1. EASIEST: Use https://realfavicongenerator.net/');
console.log('   - Upload public/Insight-logo.png');
console.log('   - Download and extract to public/ folder\n');
console.log('2. COMMAND LINE: Install ImageMagick and run:');
console.log('   magick public/Insight-logo.png -resize 192x192 public/icon-192.png');
console.log('   magick public/Insight-logo.png -resize 512x512 public/icon-512.png');
console.log('   magick public/Insight-logo.png -resize 32x32 public/favicon.ico\n');
console.log('3. NODE.JS: Install sharp and uncomment code in this file:');
console.log('   npm install sharp');
console.log('   node generate-icons.js\n');
console.log('Required icons:');
console.log('  ✓ icon-192.png (192x192)');
console.log('  ✓ icon-512.png (512x512)');
console.log('  ✓ favicon.ico (32x32)');
console.log('  ✓ apple-touch-icon.png (180x180) - optional\n');
