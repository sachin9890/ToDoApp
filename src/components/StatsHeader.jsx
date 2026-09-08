import { getDueStatus } from '../utils.js'

export function StatsHeader({ todos }) {
  const total = todos.length
  const active = todos.filter((t) => !t.completed).length
  const completed = todos.filter((t) => t.completed).length
  const overdue = todos.filter(
    (t) => getDueStatus(t.dueDate) === 'overdue' && !t.completed
  ).length

  const stats = [
    { label: 'All tasks', value: total, color: 'from-violet-500 to-indigo-500', ring: 'ring-violet-500/20' },
    { label: 'Active', value: active, color: 'from-sky-500 to-cyan-500', ring: 'ring-sky-500/20' },
    { label: 'Completed', value: completed, color: 'from-emerald-400 to-teal-500', ring: 'ring-emerald-500/20' },
    { label: 'Overdue', value: overdue, color: 'from-rose-500 to-pink-500', ring: 'ring-rose-500/20' }
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 animate-fade-in">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`rounded-xl p-3 text-center ring-1 ring-inset ${s.ring} bg-white/60 dark:bg-white/5 backdrop-blur-lg border border-white/40 dark:border-white/10 shadow-sm`}
        >
          <div
            className={`mx-auto mb-1 w-8 h-8 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center text-white font-bold shadow-md`}
          >
            {s.value}
          </div>
          <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {s.label}
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatsHeader
