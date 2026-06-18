export function PageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="min-h-[40vh] flex items-center justify-center px-4">
      <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">{label}</p>
    </div>
  )
}
