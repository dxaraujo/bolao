import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
			'@bolao/shared': path.resolve(__dirname, '../shared/src'),
		},
	},
	server: {
		port: 3000,
		open: true,
	},
	build: {
		outDir: 'build',
		sourcemap: true,
	},
})
