#!/usr/bin/env node
/**
 * Image Optimization Script
 * Converts images to WebP format and optimizes them for web
 * Run: node scripts/optimize-images.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { compare } from 'node:util';

const root = process.cwd();
const sourceDir = path.join(root, 'content', 'images');
const outputDir = path.join(root, 'dist', 'images_optimized');
const manifestPath = path.join(root, '.image-manifest.json');

// Configuration
const config = {
  outputFormat: 'webp',
  webpQuality: 80,
  webpPreserveMetadata: false,
  webpLossless: false,
  webpEffort: 3,
  outputScale: 1,
  keepOriginals: false,
  compressOriginals: true,
  minification: true,
};

// Supported formats
const supportedFormats = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg'];

// Statistics tracking
let stats = {
  processed: 0,
  converted: 0,
  skipped: 0,
  totalOriginalSize: 0,
  totalOptimizedSize: 0,
  savings: 0,
};

async function getFileType(filePath) {
  const ext = path.extname(filePath).toLowerCase().replace('.', '');
  return supportedFormats.includes(ext) ? ext : null;
}

async function shouldConvert(originalFormat) {
  // SVG files don't need conversion
  if (originalFormat === 'svg') return false;
  
  // Already WebP files don't need conversion
  if (originalFormat === 'webp') return false;
  
  return true;
}

async function optimizeImage(inputPath, outputPath, originalFormat) {
  try {
    const inputStats = fs.statSync(inputPath);
    stats.totalOriginalSize += inputStats.size;

    let sharpInstance = sharp(inputPath);

    // Format-specific optimizations
    if (originalFormat === 'png') {
      // PNG optimizations
      sharpInstance = sharpInstance.png({
        compressionLevel: 9,
        palette: true,
      });
    } else if (originalFormat === 'gif') {
      // GIF optimizations
      sharpInstance = sharpInstance.gif({
        lossless: true,
      });
    } else if (originalFormat === 'jpeg' || originalFormat === 'jpg') {
      // JPEG optimizations
      sharpInstance = sharpInstance.jpeg({
        quality: config.webpQuality,
        chromaSubsampling: '4:2:0',
        optimizeProgress: true,
      });
    }

    // Convert to WebP if needed
    if (await shouldConvert(originalFormat)) {
      sharpInstance = sharpInstance.webp({
        quality: config.webpQuality,
        effort: config.webpEffort,
        lossless: config.webpLossless,
      });
      stats.converted++;
    }

    // Resize if needed (maintain aspect ratio)
    if (config.outputScale !== 1) {
      sharpInstance = sharpInstance.resize({
        width: Math.round(inputStats.width * config.outputScale),
        height: Math.round(inputStats.height * config.outputScale),
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Convert and write
    const outputBuffer = await sharpInstance.toBuffer();
    
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, outputBuffer);

    const optimizedSize = outputBuffer.length;
    stats.totalOptimizedSize += optimizedSize;
    stats.processed++;

    return {
      original: inputStats.size,
      optimized: optimizedSize,
      savings: Math.round(((inputStats.size - optimizedSize) / inputStats.size) * 100),
      format: config.outputFormat,
    };
  } catch (error) {
    console.error(`❌ Failed to optimize ${inputPath}:`, error.message);
    return null;
  }
}

async function processDirectory(inputDir, outputDir) {
  const files = [];

  try {
    // Read directory recursively
    const readDir = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          readDir(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (supportedFormats.includes(ext.slice(1))) {
            files.push({
              path: fullPath,
              relative: path.relative(inputDir, fullPath),
              ext: ext.slice(1),
            });
          }
        }
      }
    };

    readDir(inputDir);

    // Process each image
    for (const file of files) {
      const result = await optimizeImage(file.path, 
        path.join(outputDir, file.relative),
        file.ext
      );

      if (result) {
        console.log(`✅ ${file.relative} (${result.original.toLocaleString()} → ${result.optimized.toLocaleString()} bytes, ${result.savings}% savings)`);
        stats.savings += result.savings;
      }
    }
  } catch (error) {
    console.error('❌ Error reading directory:', error.message);
  }
}

function saveManifest(images, outputPath) {
  const manifest = images.map(img => ({
    path: img.path,
    originalSize: img.originalSize,
    optimizedSize: img.optimizedSize,
    savings: img.savings,
    format: img.format,
  }));

  fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));
  console.log(`\n💾 Image manifest saved to: ${outputPath}`);
}

function printStatistics() {
  const percentage = stats.totalOriginalSize > 0 
    ? Math.round(((stats.totalOriginalSize - stats.totalOptimizedSize) / stats.totalOriginalSize) * 100)
    : 0;

  const savingsBytes = stats.totalOriginalSize - stats.totalOptimizedSize;
  const formatBytes = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

  console.log('\n📊 Optimization Statistics:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📁 Processed images:  ${stats.processed}`);
  console.log(`🔄 Converted:         ${stats.converted}`);
  console.log(`⏭️ Skipped:           ${stats.skipped}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📦 Original size:     ${formatBytes(stats.totalOriginalSize)}`);
  console.log(`📦 Optimized size:    ${formatBytes(stats.totalOptimizedSize)}`);
  console.log(`💾 Space saved:       ${formatBytes(savingsBytes)} (${percentage}%)`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

async function main() {
  console.log('🖼️  Starting Image Optimization...\n');
  console.log('Configuration:');
  console.log(`  Output format:    ${config.outputFormat.toUpperCase()}`);
  console.log(`  Quality:          ${config.webpQuality}%`);
  console.log(`  Preserve metadata: ${config.webpPreserveMetadata}`);
  console.log(`  Process directory: ${path.relative(root, sourceDir)}`);
  console.log(`  Output directory:  ${path.relative(root, outputDir)}\n`);

  // Create output directory
  fs.mkdirSync(outputDir, { recursive: true });

  // Process images
  await processDirectory(sourceDir, outputDir);

  // Generate manifest
  const images = fs.readdirSync(sourceDir, { withFileTypes: true }).filter(entry => 
    entry.isFile() && supportedFormats.includes(path.extname(entry.name).slice(1))
  );

  saveManifest(images, manifestPath);

  // Print statistics
  printStatistics();

  console.log('✅ Image optimization complete!');
  console.log(`📁 Optimized images available in: ${outputDir}`);
  console.log(`📊 Overall savings: ${percentage}%`);
}

// Run
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
