import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

/** Keep web marketing screenshots in sync with mobile/public/new-app-images */
function syncMarketingScreenshots() {
  const src = join(__dirname, 'mobile/public/new-app-images')
  const dest = join(__dirname, 'public/new-app-images')

  const copy = () => {
    if (!existsSync(src)) return
    mkdirSync(dest, { recursive: true })
    for (const entry of readdirSync(src)) {
      const srcPath = join(src, entry)
      if (statSync(srcPath).isFile()) {
        copyFileSync(srcPath, join(dest, entry))
      }
    }
  }

  return {
    name: 'sync-marketing-screenshots',
    buildStart: copy,
    configureServer: copy,
  }
}

// Plugin to copy marketing dist to main dist
function copyMarketingDist() {
  return {
    name: 'copy-marketing-dist',
    closeBundle() {
      const marketingSrc = 'marketing/dist'
      const marketingDest = 'dist/marketing-dist'
      
      try {
        // Check if marketing/dist exists before attempting to copy
        try {
          statSync(marketingSrc)
        } catch {
          // marketing/dist doesn't exist — marketing is part of the main app build
          return
        }

        // Create destination directory
        mkdirSync(marketingDest, { recursive: true })
        
        // Copy all files from marketing/dist to dist/marketing-dist
        function copyRecursive(src: string, dest: string) {
          const entries = readdirSync(src)
          for (const entry of entries) {
            const srcPath = join(src, entry)
            const destPath = join(dest, entry)
            if (statSync(srcPath).isDirectory()) {
              mkdirSync(destPath, { recursive: true })
              copyRecursive(srcPath, destPath)
            } else {
              copyFileSync(srcPath, destPath)
            }
          }
        }
        
        copyRecursive(marketingSrc, marketingDest)
        console.log('✓ Copied marketing site to dist/marketing-dist')
      } catch (error) {
        console.warn('⚠ Could not copy marketing dist:', error)
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), syncMarketingScreenshots(), copyMarketingDist()],
})
