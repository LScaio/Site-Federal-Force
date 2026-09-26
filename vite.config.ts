import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Hospedagem em subpasta (ex.: GitHub Pages): BASE_PATH=/Site-Federal-Force/ npm run build
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    // three + drei formam um chunk grande, mas carregado só de forma lazy (Hero 3D / CAD).
    chunkSizeWarningLimit: 1400,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/, priority: 30 },
            { name: 'three', test: /node_modules[\\/](three|three-stdlib|@react-three|maath|troika-[^\\/]+|meshline|camera-controls|three-mesh-bvh)[\\/]/, priority: 20 },
            { name: 'motion-core', test: /node_modules[\\/](gsap|lenis|@gsap)[\\/]/, priority: 10 },
            { name: 'framer', test: /node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/, priority: 10 },
          ],
        },
      },
    },
  },
})
