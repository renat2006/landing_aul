#!/usr/bin/env node

/**
 * Image Optimization Script
 * Converts images to WebP/AVIF format and optimizes PNG/JPEG
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const QUALITY = {
  webp: 80,
  avif: 65,
  jpeg: 80,
  png: 9 // compression level
};

const INPUT_DIRS = [
  'src/assets/images',
  'src/assets/team_avatars',
  'src/assets/pixel illustrations'
];

const OUTPUT_DIR = 'src/assets/optimized';

async function optimizeImage(inputPath, outputDir) {
  const filename = path.basename(inputPath);
  const ext = path.extname(filename).toLowerCase();
  const name = path.parse(filename).name;
  
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) {
    return;
  }

  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    console.log(`Processing: ${filename} (${metadata.width}x${metadata.height})`);
    
    // Generate WebP
    await image
      .webp({ quality: QUALITY.webp })
      .toFile(path.join(outputDir, `${name}.webp`));
    
    // Generate AVIF for modern browsers
    await image
      .avif({ quality: QUALITY.avif })
      .toFile(path.join(outputDir, `${name}.avif`));
    
    // Optimize original format
    if (ext === '.png') {
      await image
        .png({ compressionLevel: QUALITY.png })
        .toFile(path.join(outputDir, filename));
    } else {
      await image
        .jpeg({ quality: QUALITY.jpeg, mozjpeg: true })
        .toFile(path.join(outputDir, filename));
    }
    
    // Generate responsive sizes for large images
    if (metadata.width > 800) {
      const sizes = [400, 800, 1200];
      for (const size of sizes) {
        if (size < metadata.width) {
          await image
            .resize(size)
            .webp({ quality: QUALITY.webp })
            .toFile(path.join(outputDir, `${name}-${size}w.webp`));
        }
      }
    }
    
    console.log(`✓ Optimized: ${filename}`);
  } catch (error) {
    console.error(`✗ Error processing ${filename}:`, error.message);
  }
}

async function processDirectory(dir, outputDir) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory not found: ${dir}`);
    return;
  }
  
  const subOutputDir = path.join(outputDir, path.basename(dir));
  if (!fs.existsSync(subOutputDir)) {
    fs.mkdirSync(subOutputDir, { recursive: true });
  }
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isFile()) {
      await optimizeImage(filePath, subOutputDir);
    }
  }
}

async function main() {
  console.log('🖼️  Starting image optimization...\n');
  
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  for (const dir of INPUT_DIRS) {
    console.log(`\n📁 Processing: ${dir}`);
    await processDirectory(dir, OUTPUT_DIR);
  }
  
  console.log('\n✅ Image optimization complete!');
  
  // Print size comparison
  const getDirectorySize = (dir) => {
    let size = 0;
    if (!fs.existsSync(dir)) return 0;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isFile()) {
        size += stat.size;
      } else if (stat.isDirectory()) {
        size += getDirectorySize(filePath);
      }
    }
    return size;
  };
  
  let originalSize = 0;
  for (const dir of INPUT_DIRS) {
    originalSize += getDirectorySize(dir);
  }
  const optimizedSize = getDirectorySize(OUTPUT_DIR);
  
  console.log(`\n📊 Size comparison:`);
  console.log(`   Original: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Optimized: ${(optimizedSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Saved: ${((1 - optimizedSize / originalSize) * 100).toFixed(1)}%`);
}

main().catch(console.error);
