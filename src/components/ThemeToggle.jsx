import { Icon } from '../icons.jsx'
import { ICONS } from '../iconPaths.js'

export function ThemeToggle({ dark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="relative w-14 h-7 rounded-full p-1 transition-colors duration-300 bg-gradient-to-r from-violet-400 to-indigo-500 dark:from-amber-400 dark:to-orange-500 shadow-inner"
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      role="switch"
      aria-checked={dark}
    >
      <span
        className={`block w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${dark ? 'translate-x-7' : 'translate-x-0'}`}
      />
      <span className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none">
        <Icon path={ICONS.sun} className="w-3 h-3 text-white opacity-90" strokeWidth={2.5} />
        <Icon path={ICONS.moon} className="w-3 h-3 text-white opacity-90" strokeWidth={2.5} />
      </span>
    </button>
  )
}

export default ThemeToggle
