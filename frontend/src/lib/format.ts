/** Formata deadline ISO para exibição (ex.: "04/07 às 15h59"). */
export function formatDeadline(deadline: string | null | undefined): string | null {
  if (!deadline) return null
  const d = new Date(deadline)
  if (Number.isNaN(d.getTime())) return null
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} às ${pad(d.getHours())}h${pad(d.getMinutes())}`
}
