export function GlassCard({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-white/40 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg shadow-indigo-950/5 dark:shadow-black/20 ${className}`}>
      {children}
    </div>
  )
}

export default GlassCard
