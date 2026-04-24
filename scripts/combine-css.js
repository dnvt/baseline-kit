#!/usr/bin/env node

/**
 * combine-css.js
 * Script to:
 * 1. Combine root component styles and theme.css into baseline-kit.css
 * 2. Copy theme files to dist directory
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Get the directory name
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Paths
const distDir = path.resolve(__dirname, '../dist')
const themeSourceDir = path.resolve(__dirname, '../packages/react/src/components/styles/theme')
const themeDestDir = path.resolve(distDir, 'theme')
const stylesCssPath = path.join(distDir, 'styles.css')
const themeCssPath = path.join(distDir, 'theme.css')
const combinedCssPath = path.join(distDir, 'baseline-kit.css')

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  console.error('Error: dist directory does not exist')
  process.exit(1)
}

// Create theme directory in dist if it doesn't exist
if (!fs.existsSync(themeDestDir)) {
  fs.mkdirSync(themeDestDir, { recursive: true })
}

// Helper function to check if a file exists
function checkFileExists(filePath, fileName) {
  if (!fs.existsSync(filePath)) {
    console.error(`Error: ${fileName} does not exist at ${filePath}`)
    return false
  }
  return true
}

// Check if input files exist
const stylesExists = checkFileExists(stylesCssPath, 'styles.css')
const themeExists = checkFileExists(themeCssPath, 'theme.css')

if (!stylesExists || !themeExists) {
  process.exit(1)
}

// Read input files
const stylesCSS = fs.readFileSync(stylesCssPath, 'utf8')
const themeCSS = fs.readFileSync(themeCssPath, 'utf8')

// Combine CSS files
const combinedCSS = `/* Baseline Kit - Combined CSS */
/* This file contains component styles and theme variables */

/* Component Styles */
${stylesCSS}

/* Theme */
${themeCSS}
`

// Write combined file
try {
  fs.writeFileSync(combinedCssPath, combinedCSS)
  console.log(`✅ Successfully created ${combinedCssPath}`)
} catch (error) {
  console.error('Error writing combined CSS file:', error)
  process.exit(1)
}

// Copy individual theme files to dist/theme directory
try {
  // Read all files in the theme source directory
  const themeFiles = fs.readdirSync(themeSourceDir)

  // Copy each theme file to dist/theme
  themeFiles.forEach((file) => {
    if (file.endsWith('.css')) {
      const sourcePath = path.join(themeSourceDir, file)
      const destPath = path.join(themeDestDir, file)
      fs.copyFileSync(sourcePath, destPath)
      console.log(`✅ Copied ${file} to ${themeDestDir}`)
    }
  })

  console.log(`✅ Successfully copied theme files to ${themeDestDir}`)
} catch (error) {
  console.error('Error copying theme files:', error)
}
