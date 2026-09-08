import { useState, useEffect, useRef, useCallback } from 'react'

const STORAGE_KEY = 'todos'
const THEME_KEY = 'taskflow-theme'
const FILTERS = ['All', 'Active', 'Completed']
const DATE_FILTERS = ['Any Date', 'Overdue', 'Due Today', 'Due Soon']

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

function loadTodos() {
  try {
    const todos = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
    return todos.map((t) => ({ ...t, dueDate: t.dueDate || null }))
  } catch {
    return []
  }
}

function saveTodos(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
}

function loadTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || 'light'
  } catch {
    return 'light'
  }
}

function toDateKey(date) {
  if (!date) return null
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function getDueStatus(dueDate) {
  if (!dueDate) return null
  const today = startOfDay(new Date())
  const due = startOfDay(new Date(dueDate))
  const diffDays = Math.floor((due - today) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'overdue'
  if (diffDays === 0) return 'today'
  if (diffDays <= 3) return 'soon'
  return 'future'
}

function formatDueDate(dueDate) {
  if (!dueDate) return ''
  const date = new Date(dueDate)
  const status = getDueStatus(dueDate)

  if (status === 'overdue') {
    const diff = startOfDay(new Date()) - startOfDay(date)
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    return `Overdue by ${days === 0 ? '1 day' : `${days} days`}`
  }

  const options = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    ...(date.getFullYear() !== new Date().getFullYear() && { year: 'numeric' })
  }
  const formatted = date.toLocaleDateString(undefined, options)

  if (status === 'today') return `Today · ${formatted}`
  if (status === 'soon') {
    const diff = startOfDay(date) - startOfDay(new Date())
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return `in ${days} day${days === 1 ? '' : 's'} · ${formatted}`
  }
  return formatted
}

// Small presentational components
function Icon({ path, className = 'w-4 h-4', strokeWidth = 2 }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  )
}

const ICONS = {
  edit: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  trash: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  plus: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
  check: 'M5 13l4 4L19 7',
  x: 'M6 18L18 6M6 6l12 12',
  sun: 'M12 3v2m0 14v2m9-9h-2M5 12H3m15.86-6.86l-1.42 1.42M6.56 17.44l-1.41 1.41m13.29 0l-1.41-1.41M6.56 6.56L5.15 5.15M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  moon: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z',
  sparkles: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z'
}

function GlassCard({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-white/40 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg shadow-indigo-950/5 dark:shadow-black/20 ${className}`}>
      {children}
    </div>
  )
}

function TodoItem({ todo, onToggle, onDelete, onEdit, onEditDueDate }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingDate, setIsEditingDate] = useState(false)
  const [editText, setEditText] = useState(todo.text)
  const [editDate, setEditDate] = useState(toDateKey(todo.dueDate) || '')
  const inputRef = useRef(null)
  const dateInputRef = useRef(null)

  const dueStatus = getDueStatus(todo.dueDate)
  const isOverdue = dueStatus === 'overdue' && !todo.completed

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  useEffect(() => {
    if (isEditingDate && dateInputRef.current) {
      dateInputRef.current.focus()
      dateInputRef.current.showPicker?.()
    }
  }, [isEditingDate])

  function handleSave() {
    const trimmed = editText.trim()
    if (trimmed) {
      onEdit(todo.id, trimmed)
      setIsEditing(false)
    } else {
      onDelete(todo.id)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') {
      setEditText(todo.text)
      setIsEditing(false)
    }
  }

  function handleDateChange(e) {
    onEditDueDate(todo.id, e.target.value || null)
    setIsEditingDate(false)
  }

  function handleDateKeyDown(e) {
    if (e.key === 'Escape') {
      setEditDate(toDateKey(todo.dueDate) || '')
      setIsEditingDate(false)
    }
  }

  function clearDueDate() {
    onEditDueDate(todo.id, null)
    setIsEditingDate(false)
  }

  const dateBadgeClass = todo.completed
    ? 'text-gray-400 dark:text-gray-500 bg-gray-100/60 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700'
    : isOverdue
      ? 'text-rose-600 dark:text-rose-400 bg-rose-50/70 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20'
      : dueStatus === 'today'
        ? 'text-amber-600 dark:text-amber-400 bg-amber-50/70 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20'
        : dueStatus === 'soon'
          ? 'text-orange-600 dark:text-orange-400 bg-orange-50/70 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20'
          : 'text-gray-500 dark:text-gray-400 bg-gray-100/60 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700'

  return (
    <li
      className={`group animate-scale-in flex flex-col sm:flex-row sm:items-center gap-2 px-4 py-3 rounded-2xl border backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
        isOverdue
          ? 'border-rose-200/70 dark:border-rose-500/20 bg-gradient-to-r from-rose-50/70 to-transparent dark:from-rose-500/10 dark:to-transparent'
          : 'border-white/40 dark:border-white/10 bg-white/70 dark:bg-white/5 hover:shadow-indigo-500/5 dark:hover:shadow-violet-500/10'
      }`}
    >
      <div className="flex items-center gap-3 w-full sm:flex-1">
        <button
          onClick={() => onToggle(todo.id)}
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
            todo.completed
              ? 'bg-gradient-to-br from-emerald-400 to-teal-500 border-transparent shadow-md shadow-emerald-500/30'
              : 'border-gray-300 dark:border-gray-600 hover:border-violet-400 dark:hover:border-violet-400 hover:scale-110'
          }`}
          aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {todo.completed && (
            <Icon path={ICONS.check} className="w-3.5 h-3.5 text-white" strokeWidth={3} />
          )}
        </button>

        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="flex-1 px-2 py-1 text-gray-800 dark:text-gray-100 bg-white/80 dark:bg-gray-800/80 border border-violet-300 dark:border-violet-500/40 rounded-lg outline-none focus:ring-2 focus:ring-violet-300 dark:focus:ring-violet-500/40 transition-all duration-200"
          />
        ) : (
          <span
            onDoubleClick={() => setIsEditing(true)}
            className={`flex-1 text-left cursor-pointer transition-all duration-200 ${
              todo.completed
                ? 'text-gray-400 dark:text-gray-500 line-through'
                : 'text-gray-800 dark:text-gray-100 hover:text-violet-600 dark:hover:text-violet-400'
            }`}
          >
            {todo.text}
          </span>
        )}

        <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 text-gray-400 dark:text-gray-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-500/10 rounded-lg transition-all duration-200"
              aria-label="Edit todo"
            >
              <Icon path={ICONS.edit} />
            </button>
          )}
          <button
            onClick={() => onDelete(todo.id)}
            className="p-1.5 text-gray-400 dark:text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all duration-200"
            aria-label="Delete todo"
          >
            <Icon path={ICONS.trash} />
          </button>
        </div>
      </div>

      <div className="flex-shrink-0 flex items-center gap-1 pl-8 sm:pl-0">
        {isEditingDate ? (
          <div className="flex items-center gap-1">
            <input
              ref={dateInputRef}
              type="date"
              value={editDate}
              onChange={handleDateChange}
              onKeyDown={handleDateKeyDown}
              onBlur={() => setIsEditingDate(false)}
              className="px-2 py-1 text-xs text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-gray-800/80 border border-violet-300 dark:border-violet-500/40 rounded-lg outline-none focus:ring-2 focus:ring-violet-300 dark:focus:ring-violet-500/40 transition-all duration-200"
            />
            {todo.dueDate && (
              <button
                onClick={clearDueDate}
                className="p-1 text-gray-400 hover:text-rose-500"
                aria-label="Clear due date"
                title="Clear due date"
              >
                <Icon path={ICONS.x} className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : todo.dueDate ? (
          <button
            onClick={() => {
              setEditDate(toDateKey(todo.dueDate) || '')
              setIsEditingDate(true)
            }}
            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-medium whitespace-nowrap hover:opacity-80 hover:scale-105 transition-all duration-300 ${dateBadgeClass}`}
            aria-label="Edit due date"
            title={`Due: ${todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : ''}`}
          >
            <Icon path={ICONS.calendar} className="w-3.5 h-3.5" />
            {formatDueDate(todo.dueDate)}
          </button>
        ) : (
          !todo.completed && (
            <button
              onClick={() => {
                setEditDate('')
                setIsEditingDate(true)
              }}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border border-dashed border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 hover:text-violet-500 hover:border-violet-300 dark:hover:text-violet-400 dark:hover:border-violet-500/40 whitespace-nowrap transition-all duration-300"
              aria-label="Set due date"
              title="Set due date"
            >
              <Icon path={ICONS.plus} className="w-3.5 h-3.5" />
              Schedule
            </button>
          )
        )}
      </div>
    </li>
  )
}

function StatsHeader({ todos }) {
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

function ThemeToggle({ dark, onToggle }) {
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

function App() {
  const [todos, setTodos] = useState(loadTodos)
  const [dark, setDark] = useState(loadTheme() === 'dark')
  const [filter, setFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('Any Date')
  const [sortBy, setSortBy] = useState('dueDate')
  const [newTodo, setNewTodo] = useState('')
  const [newDueDate, setNewDueDate] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    saveTodos(todos)
  }, [todos])

  useEffect(() => {
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const addTodo = useCallback(() => {
    const text = newTodo.trim()
    if (!text) return
    setTodos((prev) => [
      ...prev,
      { id: generateId(), text, completed: false, dueDate: newDueDate || null }
    ])
    setNewTodo('')
    setNewDueDate('')
    inputRef.current?.focus()
  }, [newTodo, newDueDate])

  const toggleTodo = useCallback((id) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }, [])

  const deleteTodo = useCallback((id) => {
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const editTodo = useCallback((id, text) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text } : t))
    )
  }, [])

  const editDueDate = useCallback((id, dueDate) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, dueDate } : t))
    )
  }, [])

  const clearCompleted = useCallback(() => {
    setTodos((prev) => prev.filter((t) => !t.completed))
  }, [])

  const matchesDateFilter = (todo) => {
    if (dateFilter === 'Any Date') return true
    if (dateFilter === 'Overdue') {
      return getDueStatus(todo.dueDate) === 'overdue' && !todo.completed
    }
    if (dateFilter === 'Due Today') {
      return getDueStatus(todo.dueDate) === 'today'
    }
    if (dateFilter === 'Due Soon') {
      const status = getDueStatus(todo.dueDate)
      return status === 'today' || status === 'soon'
    }
    return true
  }

  const filteredTodos = todos
    .filter((t) => {
      if (filter === 'Active') return !t.completed
      if (filter === 'Completed') return t.completed
      return true
    })
    .filter(matchesDateFilter)
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate) - new Date(b.dueDate)
      }
      if (sortBy === 'text') {
        return a.text.localeCompare(b.text)
      }
      return 0
    })

  const activeCount = todos.filter((t) => !t.completed).length
  const completedCount = todos.filter((t) => t.completed).length
  const overdueCount = todos.filter(
    (t) => getDueStatus(t.dueDate) === 'overdue' && !t.completed
  ).length

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="relative min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-500 overflow-x-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 transition-colors duration-500" />
      {/* Decorative floating orbs */}
      <div className="fixed -z-10 top-[-10%] left-[-5%] w-96 h-96 bg-gradient-to-br from-violet-400/30 to-indigo-500/20 dark:from-violet-500/20 dark:to-indigo-600/10 rounded-full blur-3xl animate-float" />
      <div className="fixed -z-10 bottom-[-10%] right-[-5%] w-[28rem] h-[28rem] bg-gradient-to-br from-fuchsia-400/20 to-pink-500/20 dark:from-fuchsia-500/10 dark:to-pink-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Icon path={ICONS.sparkles} className="w-6 h-6 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 dark:from-violet-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                TaskFlow
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{today}</p>
            </div>
          </div>
          <ThemeToggle dark={dark} onToggle={() => setDark((d) => !d)} />
        </div>

        {/* Stats */}
        <StatsHeader todos={todos} />

        {/* Input */}
        <GlassCard className="p-4 mb-6 animate-slide-down">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Icon
                  path="M9 5a4 4 0 110 8 4 4 0 010-8zM15 15l-3.5-3.5"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none"
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTodo()}
                  placeholder="What needs to be done?"
                  className="w-full pl-10 pr-4 py-3 text-gray-800 dark:text-gray-100 bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500 backdrop-blur transition-all duration-200"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="px-3 py-3 text-gray-700 dark:text-gray-200 bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all duration-200"
                  aria-label="Due date"
                  title="Set a due date (optional)"
                />
                <button
                  onClick={addTodo}
                  disabled={!newTodo.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 flex items-center gap-2"
                >
                  <Icon path={ICONS.plus} className="w-4 h-4" strokeWidth={2.5} />
                  Add
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Today', 'Tomorrow', 'Next Week'].map((label) => {
                const today = new Date()
                let date
                if (label === 'Today') date = today
                else if (label === 'Tomorrow') {
                  date = new Date(today)
                  date.setDate(date.getDate() + 1)
                } else {
                  date = new Date(today)
                  date.setDate(date.getDate() + 7)
                }
                return (
                  <button
                    key={label}
                    onClick={() => setNewDueDate(toDateKey(date))}
                    disabled={!newTodo.trim()}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
                      newDueDate === toDateKey(date)
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-500/25'
                        : 'bg-white/60 dark:bg-gray-800/60 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-500/30 hover:bg-violet-50 dark:hover:bg-violet-500/10 backdrop-blur'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        </GlassCard>

        {/* Filter Tabs + Sort */}
        {todos.length > 0 && (
          <div className="mb-6 space-y-2 animate-fade-in">
            <div className="flex gap-1 p-1 rounded-xl bg-gray-100/70 dark:bg-gray-800/60 backdrop-blur border border-white/40 dark:border-white/5">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    filter === f
                      ? 'bg-white dark:bg-gray-700 text-violet-600 dark:text-violet-300 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  {f}
                  {f === 'All' && ` (${todos.length})`}
                  {f === 'Active' && ` (${activeCount})`}
                  {f === 'Completed' && ` (${completedCount})`}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 justify-between">
              <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-gray-100/70 dark:bg-gray-800/60 backdrop-blur border border-white/40 dark:border-white/5">
                {DATE_FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setDateFilter(f)}
                    className={`py-1.5 px-3 text-xs font-medium rounded-lg transition-all duration-200 ${
                      dateFilter === f
                        ? 'bg-white dark:bg-gray-700 text-violet-600 dark:text-violet-300 shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  >
                    {f}
                    {f === 'Overdue' && overdueCount > 0 && (
                      <span className="ml-1 text-rose-500 font-bold">({overdueCount})</span>
                    )}
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <span className="font-medium">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-2 py-1.5 bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-200"
                >
                  <option value="dueDate">Due date</option>
                  <option value="text">Alphabetical</option>
                </select>
              </label>
            </div>
          </div>
        )}

        {/* Todo List */}
        {filteredTodos.length > 0 ? (
          <ul className="space-y-2 animate-fade-in">
            {filteredTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                onEdit={editTodo}
                onEditDueDate={editDueDate}
              />
            ))}
          </ul>
        ) : todos.length === 0 ? (
          <GlassCard className="text-center py-16 animate-scale-in">
            <div className="mx-auto mb-4 w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 dark:from-violet-500/20 dark:to-indigo-500/10 flex items-center justify-center">
              <Icon path={ICONS.check} className="w-10 h-10 text-violet-400 dark:text-violet-300" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">No todos yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Add one above to get started</p>
          </GlassCard>
        ) : (
          <GlassCard className="text-center py-12 animate-scale-in">
            <p className="text-gray-500 dark:text-gray-400">
              {filter === 'Active' && '✨ All caught up! No active todos.'}
              {filter === 'Completed' && 'No completed todos yet.'}
              {filter === 'All' && dateFilter !== 'Any Date' && 'No todos match this date filter.'}
            </p>
          </GlassCard>
        )}

        {/* Footer */}
        {todos.length > 0 && (
          <div className="mt-6 flex items-center justify-between px-4 py-3 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-sm animate-slide-up">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-gray-700 dark:text-gray-200">{activeCount}</span>{' '}
              {activeCount === 1 ? 'item' : 'items'} left
              {overdueCount > 0 && (
                <span className="ml-2 text-xs text-rose-500 font-medium">
                  · {overdueCount} overdue
                </span>
              )}
            </span>
            {completedCount > 0 && (
              <button
                onClick={clearCompleted}
                className="text-sm text-gray-400 dark:text-gray-500 hover:text-rose-500 dark:hover:text-rose-400 font-medium transition-colors duration-200"
              >
                Clear completed
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
