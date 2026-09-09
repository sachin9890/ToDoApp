import { useState, useEffect, useRef, useCallback } from 'react'
import {
  FILTERS,
  DATE_FILTERS,
  THEME_KEY,
  loadTheme,
  generateId,
  toDateKey,
  getDueStatus
} from './utils.js'
import db from './db.js'
import { useAuth } from './contexts/AuthContext.jsx'
import { Icon } from './icons.jsx'
import { ICONS } from './iconPaths.js'
import GlassCard from './components/GlassCard.jsx'
import TodoItem from './components/TodoItem.jsx'
import StatsHeader from './components/StatsHeader.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'

export function TodoApp() {
  const { user, logout } = useAuth()
  const [todos, setTodos] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [dark, setDark] = useState(loadTheme() === 'dark')
  const [filter, setFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('Any Date')
  const [sortBy, setSortBy] = useState('dueDate')
  const [newTodo, setNewTodo] = useState('')
  const [newDueDate, setNewDueDate] = useState('')
  const [draggingId, setDraggingId] = useState(null)
  const [dragOverId, setDragOverId] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => {
    async function load() {
      const items = await db.todos.where('userId').equals(user.id).toArray()
      setTodos(items.map((t) => ({ ...t, dueDate: t.dueDate || null })))
      setLoaded(true)
    }
    load()
  }, [user.id])

  useEffect(() => {
    if (!loaded) return
    async function sync() {
      const existing = await db.todos.where('userId').equals(user.id).toArray()
      for (const t of existing) {
        await db.todos.delete(t.id)
      }
      for (const t of todos) {
        await db.todos.add({
          id: t.id,
          userId: user.id,
          text: t.text,
          completed: t.completed,
          dueDate: t.dueDate,
          order: t.order
        })
      }
    }
    sync()
  }, [todos, user.id, loaded])

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
      if (sortBy === 'custom') return 0
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

  const handleDragStart = useCallback((e, id) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
    setDraggingId(id)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggingId(null)
    setDragOverId(null)
  }, [])

  const handleDragEnter = useCallback((id) => {
    setDragOverId(id)
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDragLeave = useCallback((e, id) => {
    if (e.currentTarget.contains(e.relatedTarget)) return
    setDragOverId((prev) => (prev === id ? null : prev))
  }, [])

  const handleDrop = useCallback(
    (targetId) => {
      if (draggingId && draggingId !== targetId) {
        setTodos((prev) => {
          const sourceIndex = prev.findIndex((t) => t.id === draggingId)
          const targetIndex = prev.findIndex((t) => t.id === targetId)
          if (sourceIndex === -1 || targetIndex === -1) return prev
          const next = [...prev]
          const [moved] = next.splice(sourceIndex, 1)
          next.splice(targetIndex, 0, moved)
          return next
        })
        setSortBy('custom')
      }
      setDraggingId(null)
      setDragOverId(null)
    },
    [draggingId]
  )

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
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 transition-colors duration-500" />
      <div className="fixed -z-10 top-[-10%] left-[-5%] w-96 h-96 bg-gradient-to-br from-violet-400/30 to-indigo-500/20 dark:from-violet-500/20 dark:to-indigo-600/10 rounded-full blur-3xl animate-float" />
      <div className="fixed -z-10 bottom-[-10%] right-[-5%] w-[28rem] h-[28rem] bg-gradient-to-br from-fuchsia-400/20 to-pink-500/20 dark:from-fuchsia-500/10 dark:to-pink-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-start justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Icon path={ICONS.sparkles} className="w-6 h-6 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 dark:from-violet-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                TaskFlow
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                {today} · {user.username}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle dark={dark} onToggle={() => setDark((d) => !d)} />
            <button
              onClick={logout}
              className="text-sm text-gray-400 dark:text-gray-500 hover:text-rose-500 dark:hover:text-rose-400 font-medium transition-colors duration-200"
              title="Sign out"
            >
              Sign out
            </button>
          </div>
        </div>

        <StatsHeader todos={todos} />

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
                  <option value="custom">Manual order</option>
                </select>
              </label>
            </div>
          </div>
        )}

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
                draggable
                dragging={draggingId === todo.id}
                dragOver={dragOverId === todo.id && draggingId !== todo.id}
                onDragStart={(e) => handleDragStart(e, todo.id)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDragEnter={() => handleDragEnter(todo.id)}
                onDragLeave={(e) => handleDragLeave(e, todo.id)}
                onDrop={() => handleDrop(todo.id)}
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
              {filter === 'Active' && 'All caught up! No active todos.'}
              {filter === 'Completed' && 'No completed todos yet.'}
              {filter === 'All' && dateFilter !== 'Any Date' && 'No todos match this date filter.'}
            </p>
          </GlassCard>
        )}

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

export default TodoApp
