import { Link } from 'react-router-dom'
import { Icon } from '../icons.jsx'
import { ICONS } from '../iconPaths.js'

const FEATURES = [
  {
    icon: ICONS.plus,
    title: 'Task Management',
    description: 'Create, edit, and organize your tasks with due dates. Quick-set buttons let you schedule for today, tomorrow, or next week.'
  },
  {
    icon: ICONS.calendar,
    title: 'Smart Scheduling',
    description: 'Never miss a deadline. Due dates come with smart status detection — overdue, due today, due soon — with color-coded badges.'
  },
  {
    icon: ICONS.grip,
    title: 'Drag & Drop',
    description: 'Reorder your tasks by dragging them into the perfect sequence. Your custom order is saved automatically.'
  },
  {
    icon: ICONS.check,
    title: 'Smart Filtering',
    description: 'Filter by status (All, Active, Completed) or by date (Overdue, Due Today, Due Soon). Find exactly what you need.'
  },
  {
    icon: ICONS.sparkles,
    title: 'Statistics Dashboard',
    description: 'At-a-glance stats show total tasks, active count, completed count, and overdue items with gradient-colored cards.'
  },
  {
    icon: ICONS.moon,
    title: 'Dark & Light Mode',
    description: 'Switch between dark and light themes with a single toggle. Your preference is remembered across sessions.'
  },
  {
    icon: ICONS.user,
    title: 'Secure Authentication',
    description: 'Your tasks are private. Accounts are protected with bcrypt password hashing and session persistence.'
  },
  {
    icon: ICONS.eye,
    title: 'Offline-First',
    description: 'Everything runs locally in your browser using IndexedDB. No server required — your data stays on your device.'
  }
]

export function LandingPage() {
  return (
    <div className="relative min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-500 overflow-x-hidden">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 transition-colors duration-500" />
      <div className="fixed -z-10 top-[-10%] left-[-5%] w-96 h-96 bg-gradient-to-br from-violet-400/30 to-indigo-500/20 dark:from-violet-500/20 dark:to-indigo-600/10 rounded-full blur-3xl animate-float" />
      <div className="fixed -z-10 bottom-[-10%] right-[-5%] w-[28rem] h-[28rem] bg-gradient-to-br from-fuchsia-400/20 to-pink-500/20 dark:from-fuchsia-500/10 dark:to-pink-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />

      <nav className="relative z-10 max-w-6xl mx-auto px-6 py-6 flex items-center justify-between animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Icon path={ICONS.sparkles} className="w-5 h-5 text-white" strokeWidth={1.5} />
          </div>
          <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 dark:from-violet-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
            TaskFlow
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-5 py-2.5 text-sm font-semibold text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 rounded-xl transition-all duration-200"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Get started
          </Link>
        </div>
      </nav>

      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-20 pb-32 text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-violet-100 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 text-sm font-medium text-violet-600 dark:text-violet-400">
          <Icon path={ICONS.sparkles} className="w-4 h-4" strokeWidth={2} />
          Your tasks, beautifully organized
        </div>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-6">
          Manage tasks{' '}
          <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 dark:from-violet-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
            the smart way
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          TaskFlow helps you stay on top of everything with smart scheduling, drag-and-drop reordering,
          and a gorgeous interface that works offline — right in your browser.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/signup"
            className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Start for free
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-gray-600 dark:text-gray-300 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-2xl shadow-lg hover:bg-white/80 dark:hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Sign in to your account
          </Link>
        </div>
      </section>

      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Everything you need to stay productive
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Packed with features designed to help you focus on what matters most.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((feature, i) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-white/40 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg shadow-indigo-950/5 dark:shadow-black/20 p-6 hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${i * 75}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 dark:from-violet-500/20 dark:to-indigo-500/10 flex items-center justify-center mb-4 group-hover:from-violet-500/20 group-hover:to-indigo-500/20 dark:group-hover:from-violet-500/30 dark:group-hover:to-indigo-500/20 transition-all duration-300">
                <Icon path={feature.icon} className="w-6 h-6 text-violet-500 dark:text-violet-400" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-24 animate-fade-in">
        <div className="rounded-3xl border border-white/40 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg shadow-indigo-950/5 dark:shadow-black/20 p-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Ready to get organized?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-8 max-w-xl mx-auto">
            Join TaskFlow and take control of your tasks — completely free, no server required.
          </p>
          <Link
            to="/signup"
            className="inline-block px-10 py-4 text-base font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Create your account
          </Link>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/40 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Icon path={ICONS.sparkles} className="w-3.5 h-3.5 text-white" strokeWidth={2} />
            </div>
            <span className="text-sm font-bold text-gray-600 dark:text-gray-300">TaskFlow</span>
          </div>
          <nav className="flex items-center gap-8">
            <Link
              to="/about"
              className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-200"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-200"
            >
              Contact Us
            </Link>
          </nav>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Built with React & Tailwind CSS. Your data stays in your browser.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
