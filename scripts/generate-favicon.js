const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputSvg = path.join(__dirname, '../src/assets/images/Frame 9.svg');
const outputDir = path.join(__dirname, '../src/assets/images');

// Размеры для различных favicon и SEO изображений
const sizes = [
  // Favicon sizes
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 48, name: 'favicon-48x48.png' },
  { size: 64, name: 'favicon-64x64.png' },
  { size: 128, name: 'favicon-128x128.png' },
  
  // Apple Touch Icons
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 152, name: 'apple-touch-icon-152x152.png' },
  { size: 144, name: 'apple-touch-icon-144x144.png' },
  { size: 120, name: 'apple-touch-icon-120x120.png' },
  { size: 114, name: 'apple-touch-icon-114x114.png' },
  { size: 76, name: 'apple-touch-icon-76x76.png' },
  { size: 72, name: 'apple-touch-icon-72x72.png' },
  { size: 60, name: 'apple-touch-icon-60x60.png' },
  { size: 57, name: 'apple-touch-icon-57x57.png' },
  
  // Android Chrome Icons
  { size: 192, name: 'android-chrome-192x192.png' },
  { size: 512, name: 'android-chrome-512x512.png' },
  
  // PWA Icons
  { size: 96, name: 'favicon-96x96.png' },
  { size: 196, name: 'favicon-196x196.png' },
  
  // Microsoft Tiles
  { size: 144, name: 'mstile-144x144.png' },
  { size: 150, name: 'mstile-150x150.png' },
  { size: 310, name: 'mstile-310x310.png' },
];

// Специальные размеры для Open Graph и социальных сетей
const socialSizes = [
  { width: 1200, height: 630, name: 'og-image.png' }, // Open Graph
  { width: 1024, height: 512, name: 'twitter-image.png' }, // Twitter
  { width: 400, height: 400, name: 'vk-image.png' }, // VK
];

async function generateFavicons() {
  try {
    console.log('🎨 Генерируем favicon и SEO изображения из SVG логотипа...\n');

    // Проверяем существование исходного файла
    if (!fs.existsSync(inputSvg)) {
      throw new Error(`SVG файл не найден: ${inputSvg}`);
    }

    // Создаем папку если не существует
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    let successCount = 0;
    let totalFiles = sizes.length + socialSizes.length + 1; // +1 для favicon.ico

    // Генерируем квадратные favicon
    console.log('📱 Генерируем favicon различных размеров:');
    for (const { size, name } of sizes) {
      const outputPath = path.join(outputDir, name);
      
      try {
        await sharp(inputSvg)
          .resize(size, size, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 } // Прозрачный фон
          })
          .png({ 
            compressionLevel: 9,
            quality: 100
          })
          .toFile(outputPath);
        
        const stats = fs.statSync(outputPath);
        console.log(`  ✅ ${name} (${size}x${size}) - ${Math.round(stats.size / 1024)}KB`);
        successCount++;
      } catch (error) {
        console.log(`  ❌ Ошибка при создании ${name}: ${error.message}`);
      }
    }

    // Генерируем социальные изображения
    console.log('\n🌐 Генерируем изображения для социальных сетей:');
    for (const { width, height, name } of socialSizes) {
      const outputPath = path.join(outputDir, name);
      
      try {
        // Для социальных изображений используем цветной фон
        const logoSize = Math.min(width, height) * 0.6; // Логотип занимает 60% от размера
        
        await sharp({
          create: {
            width: width,
            height: height,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 1 } // Черный фон
          }
        })
        .composite([
          {
            input: await sharp(inputSvg)
              .resize(Math.round(logoSize), Math.round(logoSize), {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
              })
              .png()
              .toBuffer(),
            top: Math.round((height - logoSize) / 2),
            left: Math.round((width - logoSize) / 2)
          }
        ])
        .png({ compressionLevel: 9 })
        .toFile(outputPath);
        
        const stats = fs.statSync(outputPath);
        console.log(`  ✅ ${name} (${width}x${height}) - ${Math.round(stats.size / 1024)}KB`);
        successCount++;
      } catch (error) {
        console.log(`  ❌ Ошибка при создании ${name}: ${error.message}`);
      }
    }

    // Генерируем favicon.ico
    console.log('\n🔖 Генерируем favicon.ico:');
    try {
      const icoPath = path.join(outputDir, 'favicon.ico');
      
      // Создаем ICO файл из PNG 32x32
      await sharp(inputSvg)
        .resize(32, 32, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(icoPath.replace('.ico', '-temp.png'));
      
      // Переименовываем в .ico (современные браузеры поддерживают PNG в .ico)
      fs.renameSync(icoPath.replace('.ico', '-temp.png'), icoPath);
      
      const stats = fs.statSync(icoPath);
      console.log(`  ✅ favicon.ico (32x32) - ${Math.round(stats.size / 1024)}KB`);
      successCount++;
    } catch (error) {
      console.log(`  ❌ Ошибка при создании favicon.ico: ${error.message}`);
    }

    // Генерируем дополнительные SEO изображения
    console.log('\n📸 Генерируем дополнительные SEO изображения:');
    
    // Screenshot для PWA манифеста (широкий)
    try {
      const screenshotWide = path.join(outputDir, 'screenshot-wide.png');
      await sharp({
        create: {
          width: 1280,
          height: 720,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 1 }
        }
      })
      .composite([
        {
          input: await sharp(inputSvg)
            .resize(400, 400, {
              fit: 'contain',
              background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .png()
            .toBuffer(),
          top: 160,
          left: 440
        }
      ])
      .png({ compressionLevel: 9 })
      .toFile(screenshotWide);
      
      const stats = fs.statSync(screenshotWide);
      console.log(`  ✅ screenshot-wide.png (1280x720) - ${Math.round(stats.size / 1024)}KB`);
      successCount++;
    } catch (error) {
      console.log(`  ❌ Ошибка при создании screenshot-wide.png: ${error.message}`);
    }

    // Screenshot для PWA манифеста (узкий)
    try {
      const screenshotNarrow = path.join(outputDir, 'screenshot-narrow.png');
      await sharp({
        create: {
          width: 640,
          height: 1136,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 1 }
        }
      })
      .composite([
        {
          input: await sharp(inputSvg)
            .resize(320, 320, {
              fit: 'contain',
              background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .png()
            .toBuffer(),
          top: 408,
          left: 160
        }
      ])
      .png({ compressionLevel: 9 })
      .toFile(screenshotNarrow);
      
      const stats = fs.statSync(screenshotNarrow);
      console.log(`  ✅ screenshot-narrow.png (640x1136) - ${Math.round(stats.size / 1024)}KB`);
      successCount++;
    } catch (error) {
      console.log(`  ❌ Ошибка при создании screenshot-narrow.png: ${error.message}`);
    }

    console.log(`\n🎉 Готово! Успешно создано ${successCount} из ${totalFiles + 2} файлов.`);
    
    // Показываем какие файлы нужно добавить в HTML
    console.log('\n📋 Добавьте эти строки в <head> секцию HTML:');
    console.log(`
<!-- Favicon -->
<link rel="icon" type="image/svg+xml" href="assets/images/Frame 9.svg">
<link rel="icon" type="image/png" sizes="32x32" href="assets/images/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="assets/images/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="assets/images/apple-touch-icon.png">
<link rel="manifest" href="site.webmanifest">

<!-- Open Graph -->
<meta property="og:image" content="https://it-aul.dev/assets/images/og-image.png">

<!-- Twitter -->
<meta property="twitter:image" content="https://it-aul.dev/assets/images/twitter-image.png">
    `);

    // Обновляем site.webmanifest с правильными иконками
    console.log('\n🔧 Обновляем site.webmanifest...');
    const manifestPath = path.join(__dirname, '../src/site.webmanifest');
    
    const manifest = {
      "name": "IT-AUL - Команда разработчиков",
      "short_name": "IT-AUL",
      "description": "Профессиональная команда из 7 разработчиков. Создаем сайты, веб-приложения, мобильные приложения и MVP",
      "start_url": "/",
      "display": "standalone",
      "background_color": "#000000",
      "theme_color": "#DDD92A",
      "orientation": "portrait-primary",
      "scope": "/",
      "lang": "ru",
      "dir": "ltr",
      "icons": [
        {
          "src": "/assets/images/android-chrome-192x192.png",
          "sizes": "192x192",
          "type": "image/png",
          "purpose": "any maskable"
        },
        {
          "src": "/assets/images/android-chrome-512x512.png",
          "sizes": "512x512", 
          "type": "image/png",
          "purpose": "any"
        },
        {
          "src": "/assets/images/Frame 9.svg",
          "sizes": "any",
          "type": "image/svg+xml",
          "purpose": "any"
        }
      ],
      "categories": [
        "business",
        "productivity",
        "developer"
      ],
      "screenshots": [
        {
          "src": "/assets/images/screenshot-wide.png",
          "sizes": "1280x720",
          "type": "image/png",
          "form_factor": "wide"
        },
        {
          "src": "/assets/images/screenshot-narrow.png",
          "sizes": "640x1136",
          "type": "image/png", 
          "form_factor": "narrow"
        }
      ]
    };

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('  ✅ site.webmanifest обновлен');

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

// Запускаем генерацию
generateFavicons(); 