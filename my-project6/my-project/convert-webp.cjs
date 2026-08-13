const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const assetsDir = path.join(__dirname, 'src/assets');

// Only convert these image types (skip svg, webp)
const toConvert = ['.jpeg', '.jpg', '.png'];

async function convertToWebP() {
  const files = fs.readdirSync(assetsDir);
  
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!toConvert.includes(ext)) continue;

    const inputPath = path.join(assetsDir, file);
    const outputName = path.basename(file, ext) + '.webp';
    const outputPath = path.join(assetsDir, outputName);

    try {
      const info = await sharp(inputPath)
        .webp({ quality: 85 })
        .toFile(outputPath);

      const origSize = (fs.statSync(inputPath).size / 1024).toFixed(1);
      const newSize = (info.size / 1024).toFixed(1);
      const saved = (((origSize - newSize) / origSize) * 100).toFixed(0);

      console.log(`✅ ${file} → ${outputName}`);
      console.log(`   ${origSize} KB → ${newSize} KB (${saved}% smaller)`);
    } catch (err) {
      console.error(`❌ Failed: ${file} →`, err.message);
    }
  }

  console.log('\nDone! All images converted to WebP.');
}

convertToWebP();
