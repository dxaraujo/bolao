import { useCallback, useEffect, useState } from 'react'

const DISMISS_STORAGE_KEY = 'pwa-install-dismissed'

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandalone(): boolean {
	return (
		window.matchMedia('(display-mode: standalone)').matches ||
		(window.navigator as Navigator & { standalone?: boolean }).standalone === true
	)
}

function isIos(): boolean {
	return (
		/iphone|ipad|ipod/i.test(navigator.userAgent) ||
		(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
	)
}

function canUseWebShare(): boolean {
	return typeof navigator.share === 'function'
}

function isDismissed(): boolean {
	return localStorage.getItem(DISMISS_STORAGE_KEY) === '1'
}

export function usePwaInstall() {
	const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
	const [visible, setVisible] = useState(false)
	const [iosInstall, setIosInstall] = useState(false)

	useEffect(() => {
		if (isStandalone() || isDismissed()) return

		if (isIos()) {
			setIosInstall(true)
			setVisible(true)
		}

		function onBeforeInstallPrompt(event: Event) {
			event.preventDefault()
			setInstallEvent(event as BeforeInstallPromptEvent)
			setVisible(true)
		}

		function onAppInstalled() {
			setInstallEvent(null)
			setVisible(false)
		}

		window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
		window.addEventListener('appinstalled', onAppInstalled)

		return () => {
			window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
			window.removeEventListener('appinstalled', onAppInstalled)
		}
	}, [])

	const dismiss = useCallback(() => {
		localStorage.setItem(DISMISS_STORAGE_KEY, '1')
		setInstallEvent(null)
		setVisible(false)
	}, [])

	const install = useCallback(async () => {
		if (installEvent) {
			await installEvent.prompt()
			const { outcome } = await installEvent.userChoice

			setInstallEvent(null)
			if (outcome === 'accepted') {
				setVisible(false)
				return
			}

			dismiss()
			return
		}

		if (iosInstall && canUseWebShare()) {
			try {
				await navigator.share({
					title: document.title,
					url: window.location.href,
				})
			} catch (error) {
				if (error instanceof Error && error.name === 'AbortError') return
			}
		}
	}, [dismiss, installEvent, iosInstall])

	return {
		visible,
		canInstall: installEvent != null || (iosInstall && canUseWebShare()),
		iosInstall,
		install,
		dismiss,
	}
}
