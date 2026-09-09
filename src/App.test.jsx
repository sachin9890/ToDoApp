import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { TodoApp } from './TodoApp.jsx'

const FAKE_USER = { id: 1, username: 'testuser' }

const todoStore = new Map()
let nextId = 1

vi.mock('./db.js', () => ({
  default: {
    todos: {
      toArray: async () => [...todoStore.values()],
      add: async (item) => {
        const id = item.id || String(nextId++)
        todoStore.set(id, { ...item, id })
        return id
      },
      update: async (id, changes) => {
        const item = todoStore.get(id)
        if (item) Object.assign(item, changes)
      },
      delete: async (id) => {
        todoStore.delete(id)
      },
      clear: async () => {
        todoStore.clear()
        nextId = 1
      },
      where: () => ({
        equals: () => ({
          toArray: async () => [...todoStore.values()]
        })
      })
    },
    users: { clear: async () => {} },
    delete: async () => {},
    open: async () => {}
  }
}))

vi.mock('./contexts/AuthContext.jsx', () => ({
  useAuth: () => ({
    user: FAKE_USER,
    logout: vi.fn()
  }),
  AuthProvider: ({ children }) => children
}))

function renderApp() {
  return render(
    <MemoryRouter>
      <TodoApp />
    </MemoryRouter>
  )
}

async function seedTodos(todos) {
  todoStore.clear()
  nextId = 1
  for (const t of todos) {
    todoStore.set(t.id, { ...t, userId: FAKE_USER.id })
  }
}

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

describe('TodoApp', () => {
  beforeEach(() => {
    todoStore.clear()
    nextId = 1
  })

  describe('initial render', () => {
    it('renders header, empty state, and stats', async () => {
      renderApp()
      await waitFor(() => {
        expect(screen.getByText('TaskFlow')).toBeInTheDocument()
      })
      expect(screen.getByText('No todos yet')).toBeInTheDocument()
      expect(screen.getByText('All tasks')).toBeInTheDocument()
      expect(screen.getByText('Active')).toBeInTheDocument()
      expect(screen.getByText('Completed')).toBeInTheDocument()
      expect(screen.getByText('Overdue')).toBeInTheDocument()
    })

    it('renders date today and username in header', async () => {
      renderApp()
      await waitFor(() => {
        expect(screen.getByText('TaskFlow')).toBeInTheDocument()
      })
      const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
      expect(screen.getByText(new RegExp(today))).toBeInTheDocument()
      expect(screen.getByText(/testuser/)).toBeInTheDocument()
    })
  })

  describe('adding todos', () => {
    it('adds a todo via button click', async () => {
      renderApp()
      await waitFor(() => screen.getByPlaceholderText('What needs to be done?'))
      addTodo('Buy groceries')
      expect(screen.getByText('Buy groceries')).toBeInTheDocument()
      expect(screen.queryByText('No todos yet')).toBeNull()
    })

    it('adds a todo via Enter key', async () => {
      renderApp()
      await waitFor(() => screen.getByPlaceholderText('What needs to be done?'))
      const input = screen.getByPlaceholderText('What needs to be done?')
      fireEvent.change(input, { target: { value: 'Write code' } })
      fireEvent.keyDown(input, { key: 'Enter' })
      expect(screen.getByText('Write code')).toBeInTheDocument()
    })

    it('does not add empty todo', async () => {
      renderApp()
      await waitFor(() => screen.getByPlaceholderText('What needs to be done?'))
      fireEvent.click(screen.getByRole('button', { name: /Add/ }))
      expect(screen.getByText('No todos yet')).toBeInTheDocument()
    })

    it('clears input after adding', async () => {
      renderApp()
      await waitFor(() => screen.getByPlaceholderText('What needs to be done?'))
      addTodo('Test clear')
      const input = screen.getByPlaceholderText('What needs to be done?')
      expect(input.value).toBe('')
    })

    it('adds todo with due date', async () => {
      renderApp()
      await waitFor(() => screen.getByPlaceholderText('What needs to be done?'))
      addTodo('With date', '2026-12-25')
      expect(screen.getByText('With date')).toBeInTheDocument()
      const dateBadge = screen.getByLabelText('Edit due date')
      expect(dateBadge).toBeInTheDocument()
    })

    it('quick date buttons set due date', async () => {
      renderApp()
      await waitFor(() => screen.getByPlaceholderText('What needs to be done?'))
      const input = screen.getByPlaceholderText('What needs to be done?')
      fireEvent.change(input, { target: { value: 'Quick date' } })
      fireEvent.click(screen.getByRole('button', { name: 'Today' }))
      const dateInput = screen.getByLabelText('Due date')
      expect(dateInput.value).toBeTruthy()
    })
  })

  describe('toggling todos', () => {
    it('toggles todo completed state', async () => {
      renderApp()
      await waitFor(() => screen.getByPlaceholderText('What needs to be done?'))
      addTodo('Toggle me')
      fireEvent.click(screen.getByLabelText('Mark as complete'))
      expect(screen.getByText('Toggle me')).toHaveClass('line-through')
      expect(screen.getByLabelText('Mark as incomplete')).toBeInTheDocument()
      fireEvent.click(screen.getByLabelText('Mark as incomplete'))
      expect(screen.getByText('Toggle me')).not.toHaveClass('line-through')
    })
  })

  describe('deleting todos', () => {
    it('deletes a todo', async () => {
      renderApp()
      await waitFor(() => screen.getByPlaceholderText('What needs to be done?'))
      addTodo('Delete me')
      fireEvent.click(screen.getByLabelText('Delete todo'))
      expect(screen.queryByText('Delete me')).toBeNull()
      expect(screen.getByText('No todos yet')).toBeInTheDocument()
    })
  })

  describe('editing todos', () => {
    it('edits todo text', async () => {
      renderApp()
      await waitFor(() => screen.getByPlaceholderText('What needs to be done?'))
      addTodo('Original text')
      fireEvent.doubleClick(screen.getByText('Original text'))
      const textbox = screen.getByDisplayValue('Original text')
      fireEvent.change(textbox, { target: { value: 'Updated text' } })
      fireEvent.keyDown(textbox, { key: 'Enter' })
      expect(screen.getByText('Updated text')).toBeInTheDocument()
    })

    it('edits due date', async () => {
      renderApp()
      await waitFor(() => screen.getByPlaceholderText('What needs to be done?'))
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
    it('shows all todos by default', async () => {
      await seedTodos([
        { id: '1', text: 'Active one', completed: false, dueDate: null },
        { id: '2', text: 'Completed one', completed: true, dueDate: null }
      ])
      renderApp()
      await waitFor(() => {
        expect(screen.getByText('Active one')).toBeInTheDocument()
      })
      expect(screen.getByText('Completed one')).toBeInTheDocument()
    })

    it('filters by Active', async () => {
      await seedTodos([
        { id: '1', text: 'Active one', completed: false, dueDate: null },
        { id: '2', text: 'Completed one', completed: true, dueDate: null }
      ])
      renderApp()
      await waitFor(() => screen.getByText('Active one'))
      fireEvent.click(screen.getByRole('button', { name: /Active \(1\)/ }))
      expect(screen.getByText('Active one')).toBeInTheDocument()
      expect(screen.queryByText('Completed one')).toBeNull()
    })

    it('filters by Completed', async () => {
      await seedTodos([
        { id: '1', text: 'Active one', completed: false, dueDate: null },
        { id: '2', text: 'Completed one', completed: true, dueDate: null }
      ])
      renderApp()
      await waitFor(() => screen.getByText('Active one'))
      fireEvent.click(screen.getByRole('button', { name: /Completed \(1\)/ }))
      expect(screen.queryByText('Active one')).toBeNull()
      expect(screen.getByText('Completed one')).toBeInTheDocument()
    })

    it('shows all caught up message when no active in active filter', async () => {
      await seedTodos([
        { id: '1', text: 'Done', completed: true, dueDate: null }
      ])
      renderApp()
      await waitFor(() => screen.getByText('Done'))
      fireEvent.click(screen.getByRole('button', { name: /Active \(0\)/ }))
      expect(screen.getByText(/All caught up/)).toBeInTheDocument()
    })

    it('shows no completed message when no completed', async () => {
      await seedTodos([
        { id: '1', text: 'Active', completed: false, dueDate: null }
      ])
      renderApp()
      await waitFor(() => screen.getByText('Active'))
      fireEvent.click(screen.getByRole('button', { name: /Completed \(0\)/ }))
      expect(screen.getByText('No completed todos yet.')).toBeInTheDocument()
    })
  })

  describe('date filters', () => {
    const today = new Date().toISOString().split('T')[0]
    const past = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0]
    const soon = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]

    it('filters by Overdue', async () => {
      await seedTodos([
        { id: '1', text: 'Overdue task', completed: false, dueDate: past },
        { id: '2', text: 'Today task', completed: false, dueDate: today },
        { id: '3', text: 'Soon task', completed: false, dueDate: soon },
        { id: '4', text: 'No date task', completed: false, dueDate: null }
      ])
      renderApp()
      await waitFor(() => screen.getByText('Overdue task'))
      fireEvent.click(screen.getByRole('button', { name: /Overdue/ }))
      expect(screen.getByText('Overdue task')).toBeInTheDocument()
      expect(screen.queryByText('Today task')).toBeNull()
      expect(screen.queryByText('No date task')).toBeNull()
    })

    it('filters by Due Today', async () => {
      await seedTodos([
        { id: '1', text: 'Overdue task', completed: false, dueDate: past },
        { id: '2', text: 'Today task', completed: false, dueDate: today },
        { id: '3', text: 'Soon task', completed: false, dueDate: soon },
        { id: '4', text: 'No date task', completed: false, dueDate: null }
      ])
      renderApp()
      await waitFor(() => screen.getByText('Overdue task'))
      fireEvent.click(screen.getByRole('button', { name: /Due Today/ }))
      expect(screen.getByText('Today task')).toBeInTheDocument()
      expect(screen.queryByText('Overdue task')).toBeNull()
    })

    it('filters by Due Soon (today + soon)', async () => {
      await seedTodos([
        { id: '1', text: 'Overdue task', completed: false, dueDate: past },
        { id: '2', text: 'Today task', completed: false, dueDate: today },
        { id: '3', text: 'Soon task', completed: false, dueDate: soon },
        { id: '4', text: 'No date task', completed: false, dueDate: null }
      ])
      renderApp()
      await waitFor(() => screen.getByText('Overdue task'))
      fireEvent.click(screen.getByRole('button', { name: /Due Soon/ }))
      expect(screen.getByText('Today task')).toBeInTheDocument()
      expect(screen.getByText('Soon task')).toBeInTheDocument()
      expect(screen.queryByText('Overdue task')).toBeNull()
    })

    it('shows no match message when filter excludes all', async () => {
      await seedTodos([
        { id: '1', text: 'No date', completed: false, dueDate: null }
      ])
      renderApp()
      await waitFor(() => screen.getByText('No date'))
      fireEvent.click(screen.getByRole('button', { name: /Due Today/ }))
      expect(screen.getByText('No todos match this date filter.')).toBeInTheDocument()
    })
  })

  describe('sorting', () => {
    it('sorts by due date by default', async () => {
      await seedTodos([
        { id: '1', text: 'Later', completed: false, dueDate: '2026-12-01' },
        { id: '2', text: 'Earlier', completed: false, dueDate: '2026-01-01' },
        { id: '3', text: 'No date', completed: false, dueDate: null }
      ])
      renderApp()
      await waitFor(() => screen.getByText('Later'))
      const items = screen.getAllByRole('listitem').map((li) => li.textContent)
      expect(items[0]).toMatch(/Earlier/)
      expect(items[1]).toMatch(/Later/)
      expect(items[2]).toMatch(/No date/)
    })

    it('sorts alphabetically when selected', async () => {
      await seedTodos([
        { id: '1', text: 'Zebra', completed: false, dueDate: '2026-12-01' },
        { id: '2', text: 'Apple', completed: false, dueDate: '2026-01-01' }
      ])
      renderApp()
      await waitFor(() => screen.getByText('Zebra'))
      const select = screen.getByRole('combobox')
      fireEvent.change(select, { target: { value: 'text' } })
      const items = screen.getAllByRole('listitem').map((li) => li.textContent)
      expect(items[0]).toMatch(/Apple/)
      expect(items[1]).toMatch(/Zebra/)
    })

    it('keeps original order for unknown sort value', async () => {
      await seedTodos([
        { id: '1', text: 'Z', completed: false, dueDate: null },
        { id: '2', text: 'A', completed: false, dueDate: null }
      ])
      renderApp()
      await waitFor(() => screen.getByText('Z'))
      const select = screen.getByRole('combobox')
      fireEvent.change(select, { target: { value: 'bogus' } })
      const items = screen.getAllByRole('listitem').map((li) => li.textContent)
      expect(items[0]).toMatch(/Z/)
      expect(items[1]).toMatch(/A/)
    })
  })

  describe('drag and drop reordering', () => {
    it('sets move drop effect on dragover and highlights the target', async () => {
      await seedTodos([
        { id: '1', text: 'A', completed: false, dueDate: null },
        { id: '2', text: 'B', completed: false, dueDate: null }
      ])
      renderApp()
      await waitFor(() => screen.getByText('A'))
      const first = screen.getByText('A').closest('li')
      const second = screen.getByText('B').closest('li')
      const dt = makeDataTransfer()

      fireEvent.dragStart(first, { dataTransfer: dt })
      fireEvent.dragEnter(second, { dataTransfer: dt })
      fireEvent.dragOver(second, { dataTransfer: dt })

      expect(dt.dropEffect).toBe('move')
      expect(second).toHaveClass('ring-violet-400/40')
    })

    it('handles drag leave on tracked item', async () => {
      await seedTodos([
        { id: '1', text: 'A', completed: false, dueDate: null },
        { id: '2', text: 'B', completed: false, dueDate: null }
      ])
      renderApp()
      await waitFor(() => screen.getByText('A'))
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

    it('reorders todos via drag and drop and switches to manual order', async () => {
      await seedTodos([
        { id: '1', text: 'First', completed: false, dueDate: null },
        { id: '2', text: 'Second', completed: false, dueDate: null }
      ])
      renderApp()
      await waitFor(() => screen.getByText('First'))

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

    it('persists reordered todos to database', async () => {
      await seedTodos([
        { id: '1', text: 'A', completed: false, dueDate: null },
        { id: '2', text: 'B', completed: false, dueDate: null }
      ])
      renderApp()
      await waitFor(() => screen.getByText('A'))
      const first = screen.getByText('A').closest('li')
      const second = screen.getByText('B').closest('li')
      const dt = makeDataTransfer()
      fireEvent.dragStart(first, { dataTransfer: dt })
      fireEvent.dragEnter(second, { dataTransfer: dt })
      fireEvent.drop(second, { dataTransfer: dt })
      fireEvent.dragEnd(first, { dataTransfer: dt })

      await waitFor(async () => {
        const persisted = [...todoStore.values()]
        expect(persisted[0].text).toBe('B')
        expect(persisted[1].text).toBe('A')
      })
    })
  })

  describe('footer', () => {
    it('shows active item count', async () => {
      await seedTodos([
        { id: '1', text: 'A', completed: false, dueDate: null },
        { id: '2', text: 'B', completed: true, dueDate: null }
      ])
      renderApp()
      await waitFor(() => screen.getByText('A'))
      const footer = screen.getByText(/item left/)
      expect(footer).toBeInTheDocument()
      expect(footer.querySelector('span.font-semibold')).toHaveTextContent('1')
    })

    it('shows items left for multiple', async () => {
      await seedTodos([
        { id: '1', text: 'A', completed: false, dueDate: null },
        { id: '2', text: 'B', completed: false, dueDate: null }
      ])
      renderApp()
      await waitFor(() => screen.getByText('A'))
      expect(screen.getByText('items left')).toBeInTheDocument()
    })

    it('clears completed todos', async () => {
      await seedTodos([
        { id: '1', text: 'A', completed: false, dueDate: null },
        { id: '2', text: 'B', completed: true, dueDate: null }
      ])
      renderApp()
      await waitFor(() => screen.getByText('A'))
      fireEvent.click(screen.getByRole('button', { name: 'Clear completed' }))
      expect(screen.queryByText('B')).toBeNull()
      expect(screen.getByText('A')).toBeInTheDocument()
    })
  })

  describe('theme', () => {
    it('toggles dark mode and updates class', async () => {
      renderApp()
      await waitFor(() => screen.getByRole('switch'))
      fireEvent.click(screen.getByRole('switch'))
      expect(document.documentElement.classList.contains('dark')).toBe(true)
      expect(localStorage.getItem('taskflow-theme')).toBe('dark')
      fireEvent.click(screen.getByRole('switch'))
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })
  })

  describe('persistence', () => {
    it('saves todos to database on add', async () => {
      renderApp()
      await waitFor(() => screen.getByPlaceholderText('What needs to be done?'))
      addTodo('Persist me')
      await waitFor(async () => {
        const stored = [...todoStore.values()]
        expect(stored.length).toBe(1)
        expect(stored[0].text).toBe('Persist me')
      })
    })

    it('loads persisted todos on mount', async () => {
      await seedTodos([
        { id: '1', text: 'Persisted', completed: false, dueDate: null }
      ])
      renderApp()
      await waitFor(() => {
        expect(screen.getByText('Persisted')).toBeInTheDocument()
      })
    })
  })
})
