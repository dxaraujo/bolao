import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useRegisterSW } from 'virtual:pwa-register/react'

const UPDATE_CHECK_MS = 60 * 60 * 1000
const PWA_UPDATE_TOAST_ID = 'pwa-update'

export function PwaUpdatePrompt() {
	const periodicCheckRef = useRef<number | null>(null)

	const {
		needRefresh: [needRefresh],
		updateServiceWorker,
	} = useRegisterSW({
		immediate: true,
		onRegisteredSW(_scriptUrl, registration) {
			if (!registration || periodicCheckRef.current != null) return
			periodicCheckRef.current = window.setInterval(() => {
				void registration.update()
			}, UPDATE_CHECK_MS)
		},
	})

	useEffect(() => {
		return () => {
			if (periodicCheckRef.current != null) {
				window.clearInterval(periodicCheckRef.current)
				periodicCheckRef.current = null
			}
		}
	}, [])

	useEffect(() => {
		if (!needRefresh) {
			toast.dismiss(PWA_UPDATE_TOAST_ID)
			return
		}

		toast('Nova versão disponível', {
			id: PWA_UPDATE_TOAST_ID,
			description: 'Atualize para usar a versão mais recente.',
			duration: Infinity,
			action: {
				label: 'Atualizar',
				onClick: () => void updateServiceWorker(true),
			},
		})
	}, [needRefresh, updateServiceWorker])

	return null
}
