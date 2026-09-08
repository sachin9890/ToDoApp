import { useState, useEffect, useRef, useCallback } from 'react'

const STORAGE_KEY = 'todos'
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

// Get due status relative to today (ignoring time, only comparing dates)
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
    ? 'text-gray-400 bg-gray-50 border-gray-200'
    : isOverdue
      ? 'text-red-600 bg-red-50 border-red-200'
      : dueStatus === 'today'
        ? 'text-amber-600 bg-amber-50 border-amber-200'
        : dueStatus === 'soon'
          ? 'text-orange-600 bg-orange-50 border-orange-200'
          : 'text-gray-500 bg-gray-50 border-gray-200'

  return (
    <li
      className={`group flex flex-col sm:flex-row sm:items-center gap-2 px-4 py-3 bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 ${
        isOverdue ? 'border-red-200 bg-red-50/30' : 'border-gray-200'
      }`}
    >
      <div className="flex items-center gap-3 w-full sm:flex-1">
        <button
          onClick={() => onToggle(todo.id)}
          className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            todo.completed
              ? 'bg-emerald-500 border-emerald-500'
              : 'border-gray-300 hover:border-indigo-400'
          }`}
          aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {todo.completed && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
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
            className="flex-1 px-2 py-1 text-gray-800 border border-indigo-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
          />
        ) : (
          <span
            onDoubleClick={() => setIsEditing(true)}
            className={`flex-1 text-left cursor-pointer transition-all duration-200 ${
              todo.completed
                ? 'text-gray-400 line-through'
                : 'text-gray-800 hover:text-indigo-600'
            }`}
          >
            {todo.text}
          </span>
        )}

        <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all duration-200"
              aria-label="Edit todo"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          <button
            onClick={() => onDelete(todo.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
            aria-label="Delete todo"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Due date badge / editor */}
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
              className="px-2 py-1 text-xs text-gray-700 border border-indigo-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-200"
            />
            {todo.dueDate && (
              <button
                onClick={clearDueDate}
                className="p-1 text-gray-400 hover:text-red-500"
                aria-label="Clear due date"
                title="Clear due date"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ) : todo.dueDate ? (
          <button
            onClick={() => {
              setEditDate(toDateKey(todo.dueDate) || '')
              setIsEditingDate(true)
            }}
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border font-medium whitespace-nowrap hover:opacity-80 transition-opacity ${dateBadgeClass}`}
            aria-label="Edit due date"
            title={`Due: ${todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : ''}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDueDate(todo.dueDate)}
          </button>
        ) : (
          !todo.completed && (
            <button
              onClick={() => {
                setEditDate('')
                setIsEditingDate(true)
              }}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-full border border-dashed border-gray-300 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-indigo-500 hover:border-indigo-300 whitespace-nowrap transition-all duration-200"
              aria-label="Set due date"
              title="Set due date"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Schedule
            </button>
          )
        )}
      </div>
    </li>
  )
}

function App() {
  const [todos, setTodos] = useState(loadTodos)
  const [filter, setFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('Any Date')
  const [sortBy, setSortBy] = useState('dueDate')
  const [newTodo, setNewTodo] = useState('')
  const [newDueDate, setNewDueDate] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    saveTodos(todos)
  }, [todos])

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Todo
            <span className="text-indigo-600"> App</span>
          </h1>
          <p className="text-gray-500">Stay organized, get things done</p>
        </div>

        {/* Input */}
        <div className="flex flex-col gap-2 mb-6">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTodo()}
              placeholder="What needs to be done?"
              className="flex-1 px-4 py-3 text-gray-800 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400 transition-all duration-200"
            />
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="px-3 py-3 text-gray-700 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              aria-label="Due date"
              title="Set a due date (optional)"
            />
            <button
              onClick={addTodo}
              disabled={!newTodo.trim()}
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl shadow-sm hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              Add
            </button>
          </div>
          <div className="flex gap-2 justify-end">
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
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
                    newDueDate === toDateKey(date)
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Filter Tabs + Sort */}
        {todos.length > 0 && (
          <div className="mb-6 space-y-2">
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    filter === f
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
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
              <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
                {DATE_FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setDateFilter(f)}
                    className={`py-1.5 px-3 text-xs font-medium rounded-lg transition-all duration-200 ${
                      dateFilter === f
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {f}
                    {f === 'Overdue' && overdueCount > 0 && (
                      <span className="ml-1 text-red-500 font-bold">({overdueCount})</span>
                    )}
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-1 text-xs text-gray-500">
                <span className="font-medium">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
          <ul className="space-y-2">
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
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">No todos yet</p>
            <p className="text-gray-400 text-sm mt-1">Add one above to get started</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">
              {filter === 'Active' && 'All caught up! No active todos.'}
              {filter === 'Completed' && 'No completed todos yet.'}
              {filter === 'All' && dateFilter !== 'Any Date' && 'No todos match this date filter.'}
            </p>
          </div>
        )}

        {/* Footer */}
        {todos.length > 0 && (
          <div className="mt-6 flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-sm">
            <span className="text-sm text-gray-500">
              <span className="font-medium text-gray-700">{activeCount}</span>{' '}
              {activeCount === 1 ? 'item' : 'items'} left
              {overdueCount > 0 && (
                <span className="ml-2 text-xs text-red-500 font-medium">
                  · {overdueCount} overdue
                </span>
              )}
            </span>
            {completedCount > 0 && (
              <button
                onClick={clearCompleted}
                className="text-sm text-gray-400 hover:text-red-500 font-medium transition-colors duration-200"
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
