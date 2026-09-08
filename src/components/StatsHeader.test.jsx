import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatsHeader from './StatsHeader.jsx'

function makeTodos(overrides = {}) {
  const defaults = {
    id: '1',
    text: 'todo',
    completed: false,
    dueDate: null
  }
  return { ...defaults, ...overrides }
}

describe('StatsHeader', () => {
  it('renders zero counts for empty list', () => {
    render(<StatsHeader todos={[]} />)
    const values = screen.getAllByText('0')
    expect(values.length).toBe(4)
  })

  it('renders correct counts for mixed todos', () => {
    const past = new Date()
    past.setDate(past.getDate() - 2)
    const todos = [
      makeTodos({ id: '1', text: 'active' }),
      makeTodos({ id: '2', text: 'done', completed: true }),
      makeTodos({ id: '3', text: 'overdue', dueDate: past.toISOString() })
    ]
    render(<StatsHeader todos={todos} />)

    expect(screen.getByText('All tasks')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('Overdue')).toBeInTheDocument()

    const labels = ['All tasks', 'Active', 'Completed', 'Overdue']
    const expected = {
      'All tasks': '3',
      'Active': '2',
      'Completed': '1',
      'Overdue': '1'
    }
    labels.forEach((label) => {
      const labelEl = screen.getByText(label)
      const card = labelEl.closest('.rounded-xl')
      expect(card.querySelector('div.mx-auto')).toHaveTextContent(expected[label])
    })
  })

  it('does not count completed overdue as overdue', () => {
    const past = new Date()
    past.setDate(past.getDate() - 2)
    const todos = [
      makeTodos({ id: '1', text: 'done overdue', completed: true, dueDate: past.toISOString() })
    ]
    render(<StatsHeader todos={todos} />)
    const card = screen.getByText('Overdue').closest('.rounded-xl')
    expect(card.querySelector('div.mx-auto')).toHaveTextContent('0')
  })
})
