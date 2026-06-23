import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// API calls from the browser are blocked by CORS on all three LLM providers.
// The dev server acts as a relay: browser → localhost proxy → actual API.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/proxy/newsapi': {
        target: 'https://newsapi.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/newsapi/, ''),
      },
      '/proxy/anthropic': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/anthropic/, ''),
      },
      '/proxy/openai': {
        target: 'https://api.openai.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/openai/, ''),
      },
      '/proxy/gemini': {
        target: 'https://generativelanguage.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/gemini/, ''),
      },
    },
  },
})
