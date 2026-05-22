export function LiveDot() {
	return (
		<span className="relative inline-flex h-2 w-2">
			<span className="absolute inset-0 animate-ping rounded-full bg-red opacity-70" />
			<span className="relative inline-block h-2 w-2 rounded-full bg-red" />
		</span>
	)
}
