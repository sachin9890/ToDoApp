import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import App from './App.jsx'
import { STORAGE_KEY } from './utils.js'

function addTodo(text, dueDate = '') {
  const input = screen.getByPlaceholderText('What needs to be done?')
  fireEvent.change(input, { target: { value: text } })
  const dateInput = screen.getByLabelText('Due date')
  if (dueDate) {
    fireEvent.change(dateInput, { target: { value: dueDate } })
  }
  fireEvent.click(screen.getByRole('button', { name: /Add/ }))
}

function makeDataTransfer() {
  return {
    effectAllowed: '',
    dropEffect: '',
    setData: vi.fn(),
    getData: vi.fn(() => '1'),
    types: ['text/plain']
  }
}

describe('App', () => {
  describe('initial render', () => {
    it('renders header, empty state, and stats', () => {
      render(<App />)
      expect(screen.getByText('TaskFlow')).toBeInTheDocument()
      expect(screen.getByText('No todos yet')).toBeInTheDocument()
      expect(screen.getByText('All tasks')).toBeInTheDocument()
      expect(screen.getByText('Active')).toBeInTheDocument()
      expect(screen.getByText('Completed')).toBeInTheDocument()
      expect(screen.getByText('Overdue')).toBeInTheDocument()
    })

    it('renders date today in header', () => {
      render(<App />)
      const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
      expect(screen.getByText(today)).toBeInTheDocument()
    })
  })

  describe('adding todos', () => {
    it('adds a todo via button click', () => {
      render(<App />)
      addTodo('Buy groceries')
      expect(screen.getByText('Buy groceries')).toBeInTheDocument()
      expect(screen.queryByText('No todos yet')).toBeNull()
    })

    it('adds a todo via Enter key', () => {
      render(<App />)
      const input = screen.getByPlaceholderText('What needs to be done?')
      fireEvent.change(input, { target: { value: 'Write code' } })
      fireEvent.keyDown(input, { key: 'Enter' })
      expect(screen.getByText('Write code')).toBeInTheDocument()
    })

    it('does not add empty todo', () => {
      render(<App />)
      fireEvent.click(screen.getByRole('button', { name: /Add/ }))
      expect(screen.getByText('No todos yet')).toBeInTheDocument()
    })

    it('clears input after adding', () => {
      render(<App />)
      addTodo('Test clear')
      const input = screen.getByPlaceholderText('What needs to be done?')
      expect(input.value).toBe('')
    })

    it('adds todo with due date', () => {
      render(<App />)
      addTodo('With date', '2026-12-25')
      expect(screen.getByText('With date')).toBeInTheDocument()
      const dateBadge = screen.getByLabelText('Edit due date')
      expect(dateBadge).toBeInTheDocument()
    })

    it('quick date buttons set due date', () => {
      render(<App />)
      const input = screen.getByPlaceholderText('What needs to be done?')
      fireEvent.change(input, { target: { value: 'Quick date' } })
      fireEvent.click(screen.getByRole('button', { name: 'Today' }))
      const dateInput = screen.getByLabelText('Due date')
      expect(dateInput.value).toBeTruthy()
    })
  })

  describe('toggling todos', () => {
    it('toggles todo completed state', () => {
      render(<App />)
      addTodo('Toggle me')
      fireEvent.click(screen.getByLabelText('Mark as complete'))
      expect(screen.getByText('Toggle me')).toHaveClass('line-through')
      expect(screen.getByLabelText('Mark as incomplete')).toBeInTheDocument()
      fireEvent.click(screen.getByLabelText('Mark as incomplete'))
      expect(screen.getByText('Toggle me')).not.toHaveClass('line-through')
    })
  })

  describe('deleting todos', () => {
    it('deletes a todo', () => {
      render(<App />)
      addTodo('Delete me')
      fireEvent.click(screen.getByLabelText('Delete todo'))
      expect(screen.queryByText('Delete me')).toBeNull()
      expect(screen.getByText('No todos yet')).toBeInTheDocument()
    })
  })

  describe('editing todos', () => {
    it('edits todo text', () => {
      render(<App />)
      addTodo('Original text')
      fireEvent.doubleClick(screen.getByText('Original text'))
      const textbox = screen.getByDisplayValue('Original text')
      fireEvent.change(textbox, { target: { value: 'Updated text' } })
      fireEvent.keyDown(textbox, { key: 'Enter' })
      expect(screen.getByText('Updated text')).toBeInTheDocument()
    })

    it('edits due date', () => {
      render(<App />)
      addTodo('Date edit', '2026-12-25')
      const item = screen.getByText('Date edit').closest('li')
      fireEvent.click(screen.getByLabelText('Edit due date'))
      const dateInput = within(item).getByDisplayValue('2026-12-25')
      expect(dateInput).toBeInTheDocument()
      fireEvent.change(dateInput, { target: { value: '2026-06-15' } })
      expect(screen.getByLabelText('Edit due date')).toBeInTheDocument()
    })
  })

  describe('filters', () => {
    beforeEach(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([
        { id: '1', text: 'Active one', completed: false, dueDate: null },
        { id: '2', text: 'Completed one', completed: true, dueDate: null }
      ]))
    })

    it('shows all todos by default', () => {
      render(<App />)
      expect(screen.getByText('Active one')).toBeInTheDocument()
      expect(screen.getByText('Completed one')).toBeInTheDocument()
    })

    it('filters by Active', () => {
      render(<App />)
      fireEvent.click(screen.getByRole('button', { name: /Active \(1\)/ }))
      expect(screen.getByText('Active one')).toBeInTheDocument()
      expect(screen.queryByText('Completed one')).toBeNull()
    })

    it('filters by Completed', () => {
      render(<App />)
      fireEvent.click(screen.getByRole('button', { name: /Completed \(1\)/ }))
      expect(screen.queryByText('Active one')).toBeNull()
      expect(screen.getByText('Completed one')).toBeInTheDocument()
    })

    it('shows all caught up message when no active in active filter', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([
        { id: '1', text: 'Done', completed: true, dueDate: null }
      ]))
      render(<App />)
      fireEvent.click(screen.getByRole('button', { name: /Active \(0\)/ }))
      expect(screen.getByText('✨ All caught up! No active todos.')).toBeInTheDocument()
    })

    it('shows no completed message when no completed', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([
        { id: '1', text: 'Active', completed: false, dueDate: null }
      ]))
      render(<App />)
      fireEvent.click(screen.getByRole('button', { name: /Completed \(0\)/ }))
      expect(screen.getByText('No completed todos yet.')).toBeInTheDocument()
    })
  })

  describe('date filters', () => {
    const today = new Date().toISOString().split('T')[0]
    const past = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0]
    const soon = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]

    beforeEach(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([
        { id: '1', text: 'Overdue task', completed: false, dueDate: past },
        { id: '2', text: 'Today task', completed: false, dueDate: today },
        { id: '3', text: 'Soon task', completed: false, dueDate: soon },
        { id: '4', text: 'No date task', completed: false, dueDate: null }
      ]))
    })

    it('filters by Overdue', () => {
      render(<App />)
      fireEvent.click(screen.getByRole('button', { name: /Overdue/ }))
      expect(screen.getByText('Overdue task')).toBeInTheDocument()
      expect(screen.queryByText('Today task')).toBeNull()
      expect(screen.queryByText('No date task')).toBeNull()
    })

    it('filters by Due Today', () => {
      render(<App />)
      fireEvent.click(screen.getByRole('button', { name: /Due Today/ }))
      expect(screen.getByText('Today task')).toBeInTheDocument()
      expect(screen.queryByText('Overdue task')).toBeNull()
    })

    it('filters by Due Soon (today + soon)', () => {
      render(<App />)
      fireEvent.click(screen.getByRole('button', { name: /Due Soon/ }))
      expect(screen.getByText('Today task')).toBeInTheDocument()
      expect(screen.getByText('Soon task')).toBeInTheDocument()
      expect(screen.queryByText('Overdue task')).toBeNull()
    })

    it('shows no match message when filter excludes all', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([
        { id: '1', text: 'No date', completed: false, dueDate: null }
      ]))
      render(<App />)
      const before = screen.getByText('No date')
      expect(before).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: /Due Today/ }))
      expect(screen.getByText('No todos match this date filter.')).toBeInTheDocument()
    })
  })

  describe('sorting', () => {
    it('sorts by due date by default', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([
        { id: '1', text: 'Later', completed: false, dueDate: '2026-12-01' },
        { id: '2', text: 'Earlier', completed: false, dueDate: '2026-01-01' },
        { id: '3', text: 'No date', completed: false, dueDate: null }
      ]))
      render(<App />)
      const items = screen.getAllByRole('listitem').map((li) => li.textContent)
      expect(items[0]).toMatch(/Earlier/)
      expect(items[1]).toMatch(/Later/)
      expect(items[2]).toMatch(/No date/)
    })

    it('sorts alphabetically when selected', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([
        { id: '1', text: 'Zebra', completed: false, dueDate: '2026-12-01' },
        { id: '2', text: 'Apple', completed: false, dueDate: '2026-01-01' }
      ]))
      render(<App />)
      const select = screen.getByRole('combobox')
      fireEvent.change(select, { target: { value: 'text' } })
      const items = screen.getAllByRole('listitem').map((li) => li.textContent)
      expect(items[0]).toMatch(/Apple/)
      expect(items[1]).toMatch(/Zebra/)
    })

    it('keeps original order for unknown sort value', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([
        { id: '1', text: 'Z', completed: false, dueDate: null },
        { id: '2', text: 'A', completed: false, dueDate: null }
      ]))
      render(<App />)
      const select = screen.getByRole('combobox')
      fireEvent.change(select, { target: { value: 'bogus' } })
      const items = screen.getAllByRole('listitem').map((li) => li.textContent)
      expect(items[0]).toMatch(/Z/)
      expect(items[1]).toMatch(/A/)
    })
  })

  describe('drag and drop reordering', () => {
    it('handles drag leave on tracked item', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([
        { id: '1', text: 'A', completed: false, dueDate: null },
        { id: '2', text: 'B', completed: false, dueDate: null }
      ]))
      render(<App />)
      const first = screen.getByText('A').closest('li')
      const second = screen.getByText('B').closest('li')
      const dt = makeDataTransfer()
      fireEvent.dragStart(first, { dataTransfer: dt })
      fireEvent.dragEnter(second, { dataTransfer: dt })
      fireEvent.dragLeave(second, { dataTransfer: dt })
      fireEvent.dragLeave(first, { dataTransfer: dt })
      fireEvent.dragEnd(first, { dataTransfer: dt })
      expect(screen.getAllByRole('listitem')).toHaveLength(2)
    })

    it('reorders todos via drag and drop and switches to manual order', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([
        { id: '1', text: 'First', completed: false, dueDate: null },
        { id: '2', text: 'Second', completed: false, dueDate: null }
      ]))
      render(<App />)

      const items = screen.getAllByRole('listitem')
      expect(items[0]).toHaveTextContent('First')
      expect(items[1]).toHaveTextContent('Second')

      const first = screen.getByText('First').closest('li')
      const second = screen.getByText('Second').closest('li')
      const dt = makeDataTransfer()

      fireEvent.dragStart(first, { dataTransfer: dt })
      fireEvent.dragEnter(second, { dataTransfer: dt })
      fireEvent.drop(second, { dataTransfer: dt })
      fireEvent.dragEnd(first, { dataTransfer: dt })

      const reordered = screen.getAllByRole('listitem')
      expect(reordered[0]).toHaveTextContent('Second')
      expect(reordered[1]).toHaveTextContent('First')

      const select = screen.getByRole('combobox')
      expect(select.value).toBe('custom')
    })

    it('persists reordered todos to localStorage', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([
        { id: '1', text: 'A', completed: false, dueDate: null },
        { id: '2', text: 'B', completed: false, dueDate: null }
      ]))
      render(<App />)
      const first = screen.getByText('A').closest('li')
      const second = screen.getByText('B').closest('li')
      const dt = makeDataTransfer()
      fireEvent.dragStart(first, { dataTransfer: dt })
      fireEvent.dragEnter(second, { dataTransfer: dt })
      fireEvent.drop(second, { dataTransfer: dt })
      fireEvent.dragEnd(first, { dataTransfer: dt })

      const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY))
      expect(persisted[0].text).toBe('B')
      expect(persisted[1].text).toBe('A')
    })
  })

  describe('footer', () => {
    it('shows active item count', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([
        { id: '1', text: 'A', completed: false, dueDate: null },
        { id: '2', text: 'B', completed: true, dueDate: null }
      ]))
      render(<App />)
      const footer = screen.getByText(/item left/)
      expect(footer).toBeInTheDocument()
      expect(footer.querySelector('span.font-semibold')).toHaveTextContent('1')
    })

    it('shows items left for multiple', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([
        { id: '1', text: 'A', completed: false, dueDate: null },
        { id: '2', text: 'B', completed: false, dueDate: null }
      ]))
      render(<App />)
      expect(screen.getByText('items left')).toBeInTheDocument()
    })

    it('clears completed todos', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([
        { id: '1', text: 'A', completed: false, dueDate: null },
        { id: '2', text: 'B', completed: true, dueDate: null }
      ]))
      render(<App />)
      fireEvent.click(screen.getByRole('button', { name: 'Clear completed' }))
      expect(screen.queryByText('B')).toBeNull()
      expect(screen.getByText('A')).toBeInTheDocument()
    })
  })

  describe('theme', () => {
    it('toggles dark mode and updates class', () => {
      render(<App />)
      fireEvent.click(screen.getByRole('switch'))
      expect(document.documentElement.classList.contains('dark')).toBe(true)
      expect(localStorage.getItem('taskflow-theme')).toBe('dark')
      fireEvent.click(screen.getByRole('switch'))
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })
  })

  describe('persistence', () => {
    it('saves todos to localStorage on add', () => {
      render(<App />)
      addTodo('Persist me')
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
      expect(stored.length).toBe(1)
      expect(stored[0].text).toBe('Persist me')
    })

    it('loads persisted todos on mount', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([
        { id: '1', text: 'Persisted', completed: false, dueDate: null }
      ]))
      render(<App />)
      expect(screen.getByText('Persisted')).toBeInTheDocument()
    })
  })
})
