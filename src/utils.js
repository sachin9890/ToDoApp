export const STORAGE_KEY = 'todos'
export const THEME_KEY = 'taskflow-theme'
export const FILTERS = ['All', 'Active', 'Completed']
export const DATE_FILTERS = ['Any Date', 'Overdue', 'Due Today', 'Due Soon']

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export function loadTodos() {
  try {
    const todos = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
    return todos.map((t) => ({ ...t, dueDate: t.dueDate || null }))
  } catch {
    return []
  }
}

export function saveTodos(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
}

export function loadTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || 'light'
  } catch {
    return 'light'
  }
}

export function toDateKey(date) {
  if (!date) return null
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

export function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function getDueStatus(dueDate) {
  if (!dueDate) return null
  const today = startOfDay(new Date())
  const due = startOfDay(new Date(dueDate))
  const diffDays = Math.floor((due - today) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'overdue'
  if (diffDays === 0) return 'today'
  if (diffDays <= 3) return 'soon'
  return 'future'
}

export function formatDueDate(dueDate) {
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
