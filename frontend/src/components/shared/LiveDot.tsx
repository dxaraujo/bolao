export function LiveDot() {
  return (
    <span className="relative inline-flex w-2 h-2">
      <span className="absolute inset-0 rounded-full bg-red-500 opacity-70 animate-ping2" />
      <span className="w-2 h-2 rounded-full bg-red-500" />
    </span>
  )
}
