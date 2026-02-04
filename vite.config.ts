import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        VitePWA({
            registerType: 'prompt',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],

            strategies: 'injectManifest',
            srcDir: 'src',
            filename: 'service-worker.ts',

            // Opciones para la inyección del manifiesto
            injectManifest: {
                maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
            },

            manifest: {
                name: 'Bears Trades Pro',
                short_name: 'BearsTrades',
                description: 'Plataforma de Trading y Señales en Vivo',
                theme_color: '#0B1120',
                background_color: '#0B1120',
                display: 'standalone',
                orientation: 'portrait',
                icons: [
                    {
                        src: 'icon-192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'icon-512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    },
                    {
                        src: 'icon-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ]
            }
        })
    ],
})
