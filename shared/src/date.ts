/**
 * Formata a data no fuso horário local como string ISO sem sufixo "Z"
 * (equivalente a ISO 8601 com offset implícito do ambiente).
 */

export const nowtoLocalISOString = (): string => {
	return toLocalISOString(new Date())
}

export const toLocalISOString = (date: Date): string => {
	const now = new Date()
	const offset = date.getTimezoneOffset() * 60000
	const localDate = new Date(date.getTime() - offset)
	return localDate.toISOString().slice(0, -1)
}
