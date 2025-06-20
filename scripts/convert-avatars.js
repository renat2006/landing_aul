const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const avatarsDir = path.join(__dirname, '../src/assets/team_avatars');
const outputDir = avatarsDir;

async function convertToWebP() {
  try {
    const files = fs.readdirSync(avatarsDir);
    const pngFiles = files.filter(file => file.endsWith('.png'));
    
    console.log(`🔄 Converting ${pngFiles.length} PNG files to WebP...`);
    
    for (const file of pngFiles) {
      const inputPath = path.join(avatarsDir, file);
      const outputPath = path.join(outputDir, file.replace('.png', '.webp'));
      
      const inputStats = fs.statSync(inputPath);
      const inputSizeKB = Math.round(inputStats.size / 1024);
      
      await sharp(inputPath)
        .webp({ 
          quality: 90, // высокое качество для pixel art
          effort: 6,   // максимальное сжатие
          lossless: false // можем использовать lossy для лучшего сжатия
        })
        .toFile(outputPath);
      
      const outputStats = fs.statSync(outputPath);
      const outputSizeKB = Math.round(outputStats.size / 1024);
      const compression = Math.round((1 - outputStats.size / inputStats.size) * 100);
      
      console.log(`✅ ${file} -> ${file.replace('.png', '.webp')}`);
      console.log(`   📏 ${inputSizeKB}KB -> ${outputSizeKB}KB (${compression}% сжатие)`);
    }
    
    console.log('\n🎉 Конвертация завершена!');
    console.log('💡 Не забудьте обновить пути к изображениям в коде с .png на .webp');
    
  } catch (error) {
    console.error('❌ Ошибка при конвертации:', error);
  }
}

convertToWebP(); 