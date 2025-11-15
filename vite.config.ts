import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

// Plugin to copy marketing dist to main dist
function copyMarketingDist() {
  return {
    name: 'copy-marketing-dist',
    closeBundle() {
      const marketingSrc = 'marketing/dist'
      const marketingDest = 'dist/marketing-dist'
      
      try {
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
  plugins: [react(), copyMarketingDist()],
})
