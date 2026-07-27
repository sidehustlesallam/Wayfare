import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base path for GitHub Pages static hosting compatibility
export default defineConfig({
  plugins: [react()],
  base: './',
});
