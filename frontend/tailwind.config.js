import animate from 'tailwindcss-animate'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bebas Neue"', 'cursive'],
        sans:    ['"Outfit"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        /* ── light mode ── */
        copa: {
          bg:       '#eef3f9',
          bg2:      '#e4ecf5',
          surface:  '#ffffff',
          surf2:    '#f4f8fd',
          border:   '#cad8ec',
          text:     '#0a1524',
          sub:      '#4d6a85',
          muted:    '#d0dcea',
          mutedT:   '#8fa8c0',
          acc:      '#0077b6',
          gold:     '#c27800',
          green:    '#16a34a',
          red:      '#dc2626',
          purple:   '#7c3aed',
        },
        /* ── dark mode (prefix d-) ── */
        'd-bg':      '#070d18',
        'd-bg2':     '#0d1526',
        'd-surface': '#111d2e',
        'd-surf2':   '#172438',
        'd-border':  '#1e2f45',
        'd-text':    '#f0f6ff',
        'd-sub':     '#64849f',
        'd-muted':   '#243347',
        'd-mutedT':  '#3a5270',
        'd-acc':     '#00e5ff',
        'd-gold':    '#f59e0b',
        'd-green':   '#22c55e',
        'd-red':     '#ef4444',
        'd-purple':  '#a78bfa',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
      },
      keyframes: {
        fadeUp:  { from:{opacity:'0',transform:'translateY(14px)'}, to:{opacity:'1',transform:'translateY(0)'} },
        fadeIn:  { from:{opacity:'0'}, to:{opacity:'1'} },
        ping2:   { '0%':{transform:'scale(1)',opacity:'.8'}, '75%,100%':{transform:'scale(2)',opacity:'0'} },
        pulse2:  { '0%,100%':{opacity:'1'}, '50%':{opacity:'.3'} },
        spin2:   { to:{transform:'rotate(360deg)'} },
        pop:     { from:{transform:'scale(.94)',opacity:'0'}, to:{transform:'scale(1)',opacity:'1'} },
        shimmer: { from:{backgroundPosition:'-200% 0'}, to:{backgroundPosition:'200% 0'} },
      },
      animation: {
        'fade-up':  'fadeUp .4s ease both',
        'fade-in':  'fadeIn .35s ease both',
        'ping2':    'ping2 1.4s ease infinite',
        'pulse2':   'pulse2 1.2s ease infinite',
        'spin2':    'spin2 .75s linear infinite',
        'pop':      'pop .35s ease both',
        'shimmer':  'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [animate],
}
