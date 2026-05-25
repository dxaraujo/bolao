import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
	plugins: [
		react(),
		VitePWA({
			registerType: 'prompt',
			injectRegister: null,
			workbox: {
				navigateFallbackDenylist: [/\.pdf$/],
			},
			manifest: {
				name: 'Copabet 2026',
				short_name: 'Copabet',
				description: 'Bolão da Copa do Mundo 2026',
				theme_color: '#040c1b',
				background_color: '#040c1b',
				display: 'standalone',
				orientation: 'portrait',
				start_url: '/',
				icons: [
					{ src: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
					{ src: '/favicon-512x512.png', sizes: '512x512', type: 'image/png' },
				],
			},
		}),
	],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	server: {
		port: 5173,
		proxy: {
			'/api': 'http://localhost:3000',
			'/auth': 'http://localhost:3000',
			'/healthcheck': 'http://localhost:3000',
			'/static': 'http://localhost:3000',
		},
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					react: ['react', 'react-dom', 'react-router-dom'],
					query: ['@tanstack/react-query', '@tanstack/react-query-devtools'],
					recharts: ['recharts'],
					radix: [
						'@radix-ui/react-accordion',
						'@radix-ui/react-avatar',
						'@radix-ui/react-dialog',
						'@radix-ui/react-progress',
						'@radix-ui/react-tabs',
					],
				},
			},
		},
	},
})
