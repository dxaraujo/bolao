#!/usr/bin/env node
// Driver for the Bolão web app. Launches headless Chromium (Playwright),
// optionally injects a signed JWT into localStorage to reach authenticated
// screens, navigates to one or more routes, and writes a screenshot per route.
//
// The backend's JwtStrategy.validate() trusts ANY token signed with AUTH_SECRET
// (it never hits the DB), so we mint our own token here — no Google login, no
// seeded user needed. We read AUTH_SECRET straight from backend/.env so the
// minted token always matches whatever the running backend is configured with.
//
// Usage:
//   node driver.mjs                         # login + all authed routes (admin)
//   node driver.mjs --role=spectator        # authed routes as a non-active user
//   node driver.mjs /ranking                # just one route
//   node driver.mjs --print-token           # print a JWT and exit (for curl)
//
// Screenshots land in /tmp/bolao-shots/. Console errors per page print to stderr.

import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'
import { createHmac } from 'node:crypto'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '../../..') // .claude/skills/run-bolao -> repo root
const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const SHOT_DIR = process.env.SHOT_DIR ?? '/tmp/bolao-shots'

function b64url(buf) {
	return Buffer.from(buf).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function readAuthSecret() {
	const env = readFileSync(resolve(REPO_ROOT, 'backend/.env'), 'utf8')
	const m = env.match(/^AUTH_SECRET=(.*)$/m)
	if (!m) throw new Error('AUTH_SECRET not found in backend/.env')
	return m[1].trim()
}

// Mint an HS256 JWT matching the backend's JwtPayload shape.
function mintToken({ admin = true, active = true } = {}) {
	const secret = readAuthSecret()
	const header = { alg: 'HS256', typ: 'JWT' }
	const now = Math.floor(Date.now() / 1000)
	const payload = {
		_id: '000000000000000000000001',
		email: 'driver@bolao.local',
		name: 'Driver Bot',
		isAdmin: admin,
		isActive: active,
		iat: now,
		exp: now + 60 * 60 * 24, // 24h
	}
	const data = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`
	const sig = b64url(createHmac('sha256', secret).update(data).digest())
	return `${data}.${sig}`
}

const args = process.argv.slice(2)
const role = (args.find((a) => a.startsWith('--role=')) ?? '').split('=')[1] ?? 'admin'
const token = mintToken({ admin: role === 'admin', active: role !== 'spectator' })

if (args.includes('--print-token')) {
	console.log(token)
	process.exit(0)
}

// Authed routes are reached by clicking the BottomNav (not page.goto): the
// AdminRoute guard redirects the instant /me is still undefined, so a cold
// page.goto('/admin') always bounces. Loading / once warms the /me query, then
// in-SPA nav keeps that cache so every guard passes. NAV maps path -> nav label.
const NAV = [
	{ path: '/', name: 'home', label: null }, // initial load
	{ path: '/ranking', name: 'ranking', label: 'Ranking' },
	{ path: '/apostas', name: 'apostas', label: 'Apostas' },
	{ path: '/bolao', name: 'bolao', label: 'Bolão' },
	{ path: '/stats', name: 'stats', label: 'Stats' },
	{ path: '/admin', name: 'admin', label: 'Admin' },
]
const explicitRoutes = args.filter((a) => a.startsWith('/'))

const browser = await chromium.launch({ args: ['--no-sandbox'] })
const VIEWPORT = { width: 430, height: 932 } // iPhone-ish; the app is mobile-first
let failures = 0

async function shoot(page, name) {
	await page.waitForTimeout(800) // let late data fetches paint
	const out = resolve(SHOT_DIR, `${name}.png`)
	await page.screenshot({ path: out, fullPage: true })
	const landed = new URL(page.url()).pathname
	console.log(`[${name}] landed: ${landed} -> ${out}`)
}

function watchErrors(page, label) {
	const errors = []
	page.on('console', (m) => {
		if (m.type() === 'error') errors.push(m.text())
	})
	return () => {
		if (errors.length) {
			failures += errors.length
			console.error(`[${label}] console errors:\n  ${errors.slice(0, 5).join('\n  ')}`)
		}
	}
}

// --- Anonymous: the public login screen (throwaway context, no token) ---
{
	const ctx = await browser.newContext({ viewport: VIEWPORT })
	const page = await ctx.newPage()
	const flush = watchErrors(page, 'login')
	await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 30000 })
	await shoot(page, 'login')
	flush()
	await ctx.close()
}

// --- Authed: one persistent context, click through the BottomNav ---
const authedCtx = await browser.newContext({ viewport: VIEWPORT })
await authedCtx.addInitScript((t) => {
	try {
		window.localStorage.setItem('copabet.token', t)
	} catch {}
}, token)
const page = await authedCtx.newPage()
const flush = watchErrors(page, 'authed')

const sweep = explicitRoutes.length ? NAV.filter((n) => explicitRoutes.includes(n.path)) : NAV

await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 30000 })
for (const step of sweep) {
	if (step.label) {
		await page.getByRole('link', { name: step.label, exact: true }).click()
		await page.waitForURL(`**${step.path}`, { timeout: 15000 }).catch(() => {})
	}
	await shoot(page, step.name)
}
flush()
await browser.close()
console.log(`\nDone. Screenshots in ${SHOT_DIR}. Console errors: ${failures}.`)
