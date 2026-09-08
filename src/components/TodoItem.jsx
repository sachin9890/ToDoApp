import { useState, useEffect, useRef } from 'react'
import { Icon } from '../icons.jsx'
import { ICONS } from '../iconPaths.js'
import { toDateKey, getDueStatus, formatDueDate } from '../utils.js'

export function TodoItem({
  todo,
  onToggle,
  onDelete,
  onEdit,
  onEditDueDate,
  draggable = false,
  dragging = false,
  dragOver = false,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop
}) {
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

  const borderClass = isOverdue
    ? 'border-rose-200/70 dark:border-rose-500/20 bg-gradient-to-r from-rose-50/70 to-transparent dark:from-rose-500/10 dark:to-transparent'
    : 'border-white/40 dark:border-white/10 bg-white/70 dark:bg-white/5 hover:shadow-indigo-500/5 dark:hover:shadow-violet-500/10'

  return (
    <li
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      data-todo-id={todo.id}
      className={`group animate-scale-in flex flex-col sm:flex-row sm:items-center gap-2 px-4 py-3 rounded-2xl border backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
        dragOver
          ? 'border-violet-400 dark:border-violet-400 ring-2 ring-violet-400/40 shadow-lg shadow-violet-500/20'
          : borderClass
      } ${dragging ? 'opacity-40' : ''} ${
        draggable ? 'cursor-grab active:cursor-grabbing' : ''
      }`}
    >
      {draggable && (
        <span className="hidden sm:flex flex-shrink-0 text-gray-300 dark:text-gray-600 cursor-grab active:cursor-grabbing" aria-hidden="true">
          <Icon path={ICONS.grip} className="w-4 h-4" />
        </span>
      )}

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

export default TodoItem
