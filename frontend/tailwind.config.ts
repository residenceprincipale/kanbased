import type { Config } from "tailwindcss";
import tailwindAnimate from 'tailwindcss-animate';

const createColorScale = (prefix: string, isAlpha: boolean = false) => {
	return Object.fromEntries(Array.from({ length: 12 }, (_, i) => [
		i + 1,
		isAlpha ? `var(--${prefix}${i + 1})` : `var(--${prefix}-${i + 1})`
	]))
}

export default {
	darkMode: ["class"],
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			colors: {
				background: 'var(--background)',
				foreground: 'var(--foreground)',
				gray: { ...createColorScale("gray") },
				"gray-a": createColorScale("gray-a", true),
				card: {
					DEFAULT: 'var(--card)',
					foreground: 'var(--card-foreground)'
				},
				popover: {
					DEFAULT: 'var(--popover)',
					foreground: 'var(--popover-foreground)'
				},
				primary: {
					DEFAULT: 'var(--primary)',
					foreground: 'var(--primary-foreground)'
				},
				secondary: {
					DEFAULT: 'var(--secondary)',
					foreground: 'var(--secondary-foreground)'
				},
				muted: {
					DEFAULT: 'var(--muted)',
					foreground: 'var(--muted-foreground)'
				},
				accent: {
					DEFAULT: 'var(--accent)',
					foreground: 'var(--accent-foreground)',
					...createColorScale("accent"),
				},
				destructive: {
					DEFAULT: 'var(--destructive)',
					foreground: 'var(--destructive-foreground)'
				},
				border: 'var(--border)',
				input: 'var(--input)',
				ring: 'var(--ring)',
			},
			keyframes: {
				'spinner-leaf-fade': {
					'0%, 100%': {
						opacity: '0'
					},
					'50%': {
						opacity: '1'
					}
				}
			},
			animation: {
				'spinner-leaf-fade': 'spinner-leaf-fade 800ms linear infinite'
			}
		}
	},
	plugins: [tailwindAnimate],
} satisfies Config;
