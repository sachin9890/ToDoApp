import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  STORAGE_KEY,
  THEME_KEY,
  FILTERS,
  DATE_FILTERS,
  generateId,
  loadTodos,
  saveTodos,
  loadTheme,
  toDateKey,
  startOfDay,
  getDueStatus,
  formatDueDate
} from './utils.js'

describe('constants', () => {
  it('exports expected filter lists', () => {
    expect(FILTERS).toEqual(['All', 'Active', 'Completed'])
    expect(DATE_FILTERS).toEqual(['Any Date', 'Overdue', 'Due Today', 'Due Soon'])
    expect(STORAGE_KEY).toBe('todos')
    expect(THEME_KEY).toBe('taskflow-theme')
  })
})

describe('generateId', () => {
  it('generates unique ids', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()))
    expect(ids.size).toBe(100)
  })

  it('generates string ids', () => {
    expect(typeof generateId()).toBe('string')
    expect(generateId()).toBeTruthy()
  })
})

describe('loadTodos', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns empty array when nothing stored', () => {
    expect(loadTodos()).toEqual([])
  })

  it('returns parsed todos with default dueDate', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([{ id: '1', text: 'a', completed: false }]))
    expect(loadTodos()).toEqual([{ id: '1', text: 'a', completed: false, dueDate: null }])
  })

  it('preserves existing dueDate', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([{ id: '1', text: 'a', dueDate: '2025-01-01' }]))
    expect(loadTodos()[0].dueDate).toBe('2025-01-01')
  })

  it('returns empty array on parse error', () => {
    localStorage.setItem(STORAGE_KEY, 'not json{{{')
    expect(loadTodos()).toEqual([])
  })
})

describe('saveTodos', () => {
  it('persists todos to localStorage', () => {
    const todos = [{ id: '1', text: 'x', completed: false, dueDate: null }]
    saveTodos(todos)
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual(todos)
  })
})

describe('loadTheme', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns light by default', () => {
    expect(loadTheme()).toBe('light')
  })

  it('returns stored theme', () => {
    localStorage.setItem(THEME_KEY, 'dark')
    expect(loadTheme()).toBe('dark')
  })

  it('returns light when localStorage throws', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied')
    })
    expect(loadTheme()).toBe('light')
    spy.mockRestore()
  })
})

describe('toDateKey', () => {
  it('returns null for falsy input', () => {
    expect(toDateKey(null)).toBeNull()
    expect(toDateKey('')).toBeNull()
    expect(toDateKey(undefined)).toBeNull()
  })

  it('converts a date to YYYY-MM-DD', () => {
    expect(toDateKey('2025-03-15T12:00:00Z')).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('returns ISO date part', () => {
    const d = new Date(2025, 2, 15, 10, 30, 0)
    const key = toDateKey(d.toISOString())
    expect(key.split('T')[0]).toBe(key)
    expect(key).toBe(new Date(d.toISOString()).toISOString().split('T')[0])
  })
})

describe('startOfDay', () => {
  it('zeroes out time components', () => {
    const d = new Date(2025, 5, 15, 14, 33, 22, 111)
    const sod = startOfDay(d)
    expect(sod.getHours()).toBe(0)
    expect(sod.getMinutes()).toBe(0)
    expect(sod.getSeconds()).toBe(0)
    expect(sod.getMilliseconds()).toBe(0)
    expect(sod.getDate()).toBe(15)
  })
})

describe('getDueStatus', () => {
  const today = new Date()

  it('returns null for no due date', () => {
    expect(getDueStatus(null)).toBeNull()
    expect(getDueStatus('')).toBeNull()
  })

  it('returns overdue for past date', () => {
    const past = new Date(today)
    past.setDate(past.getDate() - 5)
    expect(getDueStatus(past.toISOString())).toBe('overdue')
  })

  it('returns today for current date', () => {
    expect(getDueStatus(today.toISOString())).toBe('today')
  })

  it('returns soon for within 3 days', () => {
    const soon = new Date(today)
    soon.setDate(soon.getDate() + 3)
    expect(getDueStatus(soon.toISOString())).toBe('soon')
  })

  it('returns future for beyond 3 days', () => {
    const future = new Date(today)
    future.setDate(future.getDate() + 10)
    expect(getDueStatus(future.toISOString())).toBe('future')
  })
})

describe('formatDueDate', () => {
  const today = new Date()

  it('returns empty string for no date', () => {
    expect(formatDueDate(null)).toBe('')
    expect(formatDueDate('')).toBe('')
  })

  it('formats overdue', () => {
    const past = new Date(today)
    past.setDate(past.getDate() - 2)
    expect(formatDueDate(past.toISOString())).toMatch(/^Overdue by \d+ days?/)
  })

  it('formats today', () => {
    expect(formatDueDate(today.toISOString())).toMatch(/^Today · /)
  })

  it('formats soon', () => {
    const soon = new Date(today)
    soon.setDate(soon.getDate() + 2)
    expect(formatDueDate(soon.toISOString())).toMatch(/^in \d+ days? · /)
  })

  it('formats future without prefix', () => {
    const future = new Date(today)
    future.setDate(future.getDate() + 10)
    const result = formatDueDate(future.toISOString())
    expect(result).not.toMatch(/^(Overdue|Today|in \d+ days?)/)
    expect(result.length).toBeGreaterThan(0)
  })
})
