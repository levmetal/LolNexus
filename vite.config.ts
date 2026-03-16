import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/meraki-api': {
                target: 'https://cdn.merakianalytics.com',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/meraki-api/, ''),
            },
        },
    },
})
