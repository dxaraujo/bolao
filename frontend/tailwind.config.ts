import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

const config: Config = {
	darkMode: ['class'],
	content: ['./index.html', './src/**/*.{ts,tsx}'],
	theme: {
		container: {
			center: true,
			padding: '1rem',
		},
		extend: {
			fontFamily: {
				display: ['"Bebas Neue"', 'sans-serif'],
				sans: ['Outfit', 'system-ui', 'sans-serif'],
			},
			colors: {
				background: 'rgb(var(--bg) / <alpha-value>)',
				surface: 'rgb(var(--surface) / <alpha-value>)',
				'surface-2': 'rgb(var(--surface-2) / <alpha-value>)',
				border: 'rgb(var(--border) / <alpha-value>)',
				foreground: 'rgb(var(--text) / <alpha-value>)',
				sub: 'rgb(var(--sub) / <alpha-value>)',
				muted: 'rgb(var(--muted) / <alpha-value>)',
				'muted-foreground': 'rgb(var(--muted-fg) / <alpha-value>)',
				acc: 'rgb(var(--acc) / <alpha-value>)',
				gold: 'rgb(var(--gold) / <alpha-value>)',
				silver: 'rgb(var(--silver) / <alpha-value>)',
				bronze: 'rgb(var(--bronze) / <alpha-value>)',
				green: 'rgb(var(--green) / <alpha-value>)',
				red: 'rgb(var(--red) / <alpha-value>)',
				purple: 'rgb(var(--purple) / <alpha-value>)',
			},
			borderRadius: {
				lg: '14px',
				md: '10px',
				sm: '8px',
			},
			keyframes: {
				'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
				'fade-up': {
					from: { opacity: '0', transform: 'translateY(14px)' },
					to: { opacity: '1', transform: 'translateY(0)' },
				},
				pop: {
					from: { opacity: '0', transform: 'scale(.94)' },
					to: { opacity: '1', transform: 'scale(1)' },
				},
				ping: {
					'0%': { transform: 'scale(1)', opacity: '.8' },
					'75%,100%': { transform: 'scale(2)', opacity: '0' },
				},
			},
			animation: {
				'fade-in': 'fade-in .35s ease both',
				'fade-up': 'fade-up .4s ease both',
				pop: 'pop .35s ease both',
				ping: 'ping 1.4s ease infinite',
			},
		},
	},
	plugins: [animate],
}

export default config
