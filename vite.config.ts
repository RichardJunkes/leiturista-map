import { defineConfig, UserConfig} from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    // 👋 add the line below to add jsdom to vite
    environment: 'jsdom',
  }
} as UserConfig)