import { Download, Share, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { usePwaInstall } from '@/hooks/usePwaInstall'

export function PwaInstallBanner() {
	const { visible, canInstall, iosInstall, install, dismiss } = usePwaInstall()

	if (!visible) return null

	return (
		<div className="border-t border-acc/20 bg-acc/10 px-4 py-3 md:hidden">
			<div className="flex items-start gap-3">
				<div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-acc/15 text-acc">
					{iosInstall && !canInstall ? <Share className="h-4 w-4" /> : <Download className="h-4 w-4" />}
				</div>

				<div className="min-w-0 flex-1">
					<p className="text-sm font-semibold text-foreground">Instale o Copabet</p>
					<p className="mt-0.5 text-xs text-sub">
						{iosInstall && !canInstall
							? 'Toque em Compartilhar e depois em Adicionar à Tela de Início.'
							: 'Acesse mais rápido com o app na tela inicial.'}
					</p>

					{canInstall && (
						<Button type="button" size="sm" className="mt-2" onClick={() => void install()}>
							Instalar
						</Button>
					)}
				</div>

				<button
					type="button"
					onClick={dismiss}
					className="shrink-0 rounded-md p-1 text-sub transition-colors hover:bg-surface-2 hover:text-foreground"
					aria-label="Fechar aviso de instalação"
				>
					<X className="h-4 w-4" />
				</button>
			</div>
		</div>
	)
}
