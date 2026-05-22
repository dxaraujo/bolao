export function LoadingState({ label = 'Carregando…' }: { label?: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 px-5">
      <span className="w-8 h-8 rounded-full border-2 border-copa-border dark:border-t-[#00e5ff] animate-spin2" />
      <p className="text-xs text-copa-sub dark:text-[#64849f]">{label}</p>
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 px-5 text-center">
      <span className="text-2xl">⚠️</span>
      <p className="text-sm text-red-400">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs font-bold text-[#00e5ff] border border-[#00e5ff]/40 px-4 py-2 rounded-lg"
        >
          Tentar novamente
        </button>
      )}
    </div>
  )
}
