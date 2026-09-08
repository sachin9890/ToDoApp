import { useState, useEffect, useRef, useCallback } from 'react'

const STORAGE_KEY = 'todos'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch {
    return []
  }
}

function saveTodos(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
}

function TodoItem({ todo, onToggle, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(todo.text)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

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

  return (
    <li className="group flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
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
    </li>
  )
}

const FILTERS = ['All', 'Active', 'Completed']

function App() {
  const [todos, setTodos] = useState(loadTodos)
  const [filter, setFilter] = useState('All')
  const [newTodo, setNewTodo] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    saveTodos(todos)
  }, [todos])

  const addTodo = useCallback(() => {
    const text = newTodo.trim()
    if (!text) return
    setTodos((prev) => [...prev, { id: generateId(), text, completed: false }])
    setNewTodo('')
    inputRef.current?.focus()
  }, [newTodo])

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

  const clearCompleted = useCallback(() => {
    setTodos((prev) => prev.filter((t) => !t.completed))
  }, [])

  const filteredTodos = todos.filter((t) => {
    if (filter === 'Active') return !t.completed
    if (filter === 'Completed') return t.completed
    return true
  })

  const activeCount = todos.filter((t) => !t.completed).length
  const completedCount = todos.filter((t) => t.completed).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Todo
            <span className="text-indigo-600"> App</span>
          </h1>
          <p className="text-gray-500">Stay organized, get things done</p>
        </div>

        {/* Input */}
        <div className="flex gap-2 mb-6">
          <input
            ref={inputRef}
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
            placeholder="What needs to be done?"
            className="flex-1 px-4 py-3 text-gray-800 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400 transition-all duration-200"
          />
          <button
            onClick={addTodo}
            disabled={!newTodo.trim()}
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl shadow-sm hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
          >
            Add
          </button>
        </div>

        {/* Filter Tabs */}
        {todos.length > 0 && (
          <div className="flex gap-1 mb-6 p-1 bg-gray-100 rounded-xl">
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
            </p>
          </div>
        )}

        {/* Footer */}
        {todos.length > 0 && (
          <div className="mt-6 flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-sm">
            <span className="text-sm text-gray-500">
              <span className="font-medium text-gray-700">{activeCount}</span>{' '}
              {activeCount === 1 ? 'item' : 'items'} left
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
