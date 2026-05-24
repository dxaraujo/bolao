import { useEffect, useRef, useState } from 'react'
import { Moon, Sun, LogOut } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/providers/ThemeProvider'
import { useMe } from '@/hooks/useMe'
import { useAuth } from '@/providers/AuthProvider'
import { resolveAssetUrl } from '@/lib/assets'

export function Header() {
	const { isDark, toggle } = useTheme()
	const { data: me } = useMe()
	const { logout, user } = useAuth()
	const [menuOpen, setMenuOpen] = useState(false)
	const menuRef = useRef<HTMLDivElement>(null)

	const initial = me?.name?.charAt(0)?.toUpperCase() ?? '?'
	const avatar = me?.avatar ?? user?.avatar
	const isSpectator = user && !user.isActive

	useEffect(() => {
		if (!menuOpen) return
		function handleClick(e: MouseEvent) {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				setMenuOpen(false)
			}
		}
		document.addEventListener('mousedown', handleClick)
		return () => document.removeEventListener('mousedown', handleClick)
	}, [menuOpen])

	return (
		<header className="sticky top-0 z-40 border-b border-border bg-gradient-to-b from-surface-2 to-background px-4 py-3 md:px-6">
			<div className="flex items-center justify-between">
				<div className="font-display text-3xl leading-none tracking-wider md:hidden">
					COPA<span className="text-acc">BET</span>
					<span className="ml-2 text-xs font-medium text-sub">2026</span>
				</div>
				<div className="hidden text-sm text-sub md:block">
					Bem-vindo{me?.name ? `, ${me.name.split(' ')[0]}` : ''}
				</div>
				<div className="flex items-center gap-2">
					{isSpectator && <Badge tone="sub">Espectador</Badge>}
					{user?.isAdmin && <Badge tone="gold">Admin</Badge>}
					<Button size="icon" variant="outline" onClick={toggle} aria-label="Alternar tema">
						{isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
					</Button>
					<div ref={menuRef} className="relative">
						<button
							onClick={() => setMenuOpen((o) => !o)}
							className="rounded-full ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acc"
							aria-label="Menu do usuário"
						>
							<Avatar className="h-10 w-10">
								<AvatarImage src={avatar ? resolveAssetUrl(avatar) : undefined} alt={me?.name} />
								<AvatarFallback className="text-xs">{initial}</AvatarFallback>
							</Avatar>
						</button>
						{menuOpen && (
							<div className="absolute right-0 top-full z-50 mt-2 min-w-[180px] rounded-lg border border-border bg-surface shadow-lg">
								{me?.name && (
									<div className="border-b border-border px-3 py-2.5">
										<p className="text-sm font-semibold">{me.name.split(' ')[0]}</p>
										<p className="text-xs text-sub">{me.email}</p>
									</div>
								)}
								<button
									onClick={() => {
										setMenuOpen(false)
										logout()
									}}
									className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-red hover:bg-surface-2"
								>
									<LogOut className="h-4 w-4" />
									Sair
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</header>
	)
}
