import { format, isToday, isTomorrow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatMatchDate(iso: string | Date) {
	const d = typeof iso === 'string' ? new Date(iso) : iso
	if (isToday(d)) return `Hoje · ${format(d, 'HH:mm')}`
	if (isTomorrow(d)) return `Amanhã · ${format(d, 'HH:mm')}`
	return format(d, "dd/MM '·' HH:mm", { locale: ptBR })
}

export function formatDateShort(iso: string | Date) {
	const d = typeof iso === 'string' ? new Date(iso) : iso
	return format(d, 'dd/MM', { locale: ptBR })
}

export function formatTime(iso: string | Date) {
	const d = typeof iso === 'string' ? new Date(iso) : iso
	return format(d, 'HH:mm')
}

export function formatDeadline(iso: string | Date) {
	const d = typeof iso === 'string' ? new Date(iso) : iso
	return format(d, "dd/MM 'às' HH'h'mm", { locale: ptBR })
}
