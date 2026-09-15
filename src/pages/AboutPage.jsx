import { Link } from 'react-router-dom'
import { Icon } from '../icons.jsx'
import { ICONS } from '../iconPaths.js'

const VALUES = [
  {
    icon: ICONS.eye,
    title: 'Offline-First',
    description: 'TaskFlow runs entirely in your browser with IndexedDB. No servers, no cloud dependencies — your data stays on your device.'
  },
  {
    icon: ICONS.user,
    title: 'Privacy by Design',
    description: 'Accounts are protected with bcrypt password hashing. Your tasks are private and never leave your machine.'
  },
  {
    icon: ICONS.sparkles,
    title: 'Beautifully Simple',
    description: 'A clean, intuitive interface with drag-and-drop, smart filters, and both light and dark themes.'
  }
]

export function AboutPage() {
  return (
    <div className="relative min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-500 overflow-x-hidden">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 transition-colors duration-500" />
      <div className="fixed -z-10 top-[-10%] left-[-5%] w-96 h-96 bg-gradient-to-br from-violet-400/30 to-indigo-500/20 dark:from-violet-500/20 dark:to-indigo-600/10 rounded-full blur-3xl animate-float" />
      <div className="fixed -z-10 bottom-[-10%] right-[-5%] w-[28rem] h-[28rem] bg-gradient-to-br from-fuchsia-400/20 to-pink-500/20 dark:from-fuchsia-500/10 dark:to-pink-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        <div className="flex items-center justify-center gap-3 mb-12 animate-fade-in">
          <Link to="/" title="Back to home" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Icon path={ICONS.sparkles} className="w-6 h-6 text-white" strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 dark:from-violet-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              TaskFlow
            </h1>
          </Link>
        </div>

        <section className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-violet-100 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 text-sm font-medium text-violet-600 dark:text-violet-400">
            <Icon path={ICONS.user} className="w-4 h-4" strokeWidth={2} />
            About TaskFlow
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-6">
            Your tasks,{' '}
            <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 dark:from-violet-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              your rules
            </span>
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            TaskFlow is a lightweight, offline-first task manager built with React and Tailwind CSS.
            We believe managing your tasks shouldn&apos;t require trusting your data to a third-party server.
          </p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-16">
          {VALUES.map((value, i) => (
            <div
              key={value.title}
              className="rounded-2xl border border-white/40 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg shadow-indigo-950/5 dark:shadow-black/20 p-6 hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${i * 75}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 dark:from-violet-500/20 dark:to-indigo-500/10 flex items-center justify-center mb-4">
                <Icon path={value.icon} className="w-6 h-6 text-violet-500 dark:text-violet-400" strokeWidth={1.5} />
              </div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
                {value.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </section>

        <section className="text-center animate-fade-in">
          <div className="rounded-3xl border border-white/40 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg shadow-indigo-950/5 dark:shadow-black/20 p-12">
            <h2 className="text-3xl font-extrabold tracking-tight mb-4">
              See TaskFlow in action
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-8 max-w-xl mx-auto">
              Create your account and start organizing your tasks today — completely free.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/signup"
                className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                Get started
              </Link>
              <Link
                to="/"
                className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-gray-600 dark:text-gray-300 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-2xl shadow-lg hover:bg-white/80 dark:hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                Back to home
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AboutPage