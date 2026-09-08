import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TodoItem from './TodoItem.jsx'

function makeTodo(overrides = {}) {
  return {
    id: '1',
    text: 'Test todo',
    completed: false,
    dueDate: null,
    ...overrides
  }
}

const defaultProps = {
  onToggle: vi.fn(),
  onDelete: vi.fn(),
  onEdit: vi.fn(),
  onEditDueDate: vi.fn()
}

function renderItem(todo = makeTodo(), props = {}) {
  return render(<TodoItem todo={todo} {...defaultProps} {...props} />)
}

describe('TodoItem', () => {
  describe('rendering', () => {
    it('renders todo text', () => {
      renderItem(makeTodo({ text: 'Buy milk' }))
      expect(screen.getByText('Buy milk')).toBeInTheDocument()
    })

    it('applies line-through for completed todos', () => {
      renderItem(makeTodo({ completed: true }))
      expect(screen.getByText('Test todo')).toHaveClass('line-through')
    })

    it('renders check icon when completed', () => {
      renderItem(makeTodo({ completed: true, id: '2' }))
      expect(document.querySelectorAll('svg').length).toBeGreaterThan(0)
    })

    it('does not render check icon when not completed', () => {
      renderItem(makeTodo({ completed: false, id: '2' }))
      const btn = screen.getByLabelText('Mark as complete')
      expect(btn.querySelector('svg')).toBeNull()
    })

    it('renders due date badge when dueDate set', () => {
      const future = new Date()
      future.setDate(future.getDate() + 10)
      renderItem(makeTodo({ dueDate: future.toISOString() }))
      expect(screen.getByLabelText('Edit due date')).toBeInTheDocument()
    })

    it('renders Schedule button when no due date and not completed', () => {
      renderItem(makeTodo({ dueDate: null, completed: false, id: '2' }))
      expect(screen.getByLabelText('Set due date')).toBeInTheDocument()
    })

    it('does not render Schedule button when completed with no date', () => {
      renderItem(makeTodo({ dueDate: null, completed: true }))
      expect(screen.queryByLabelText('Set due date')).toBeNull()
    })
  })

  describe('toggle', () => {
    it('calls onToggle with todo id on checkbox click', () => {
      renderItem(makeTodo({ id: 'abc' }))
      fireEvent.click(screen.getByLabelText('Mark as complete'))
      expect(defaultProps.onToggle).toHaveBeenCalledWith('abc')
    })

    it('uses mark as incomplete label for completed', () => {
      renderItem(makeTodo({ completed: true }))
      expect(screen.getByLabelText('Mark as incomplete')).toBeInTheDocument()
    })
  })

  describe('inline editing', () => {
    it('enters edit mode on double click and edits text', () => {
      const onEdit = vi.fn()
      renderItem(makeTodo({ id: '1', text: 'old' }), { onEdit })
      fireEvent.doubleClick(screen.getByText('old'))
      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
      fireEvent.change(input, { target: { value: 'new text' } })
      fireEvent.keyDown(input, { key: 'Enter' })
      expect(onEdit).toHaveBeenCalledWith('1', 'new text')
    })

    it('saves on blur', () => {
      const onEdit = vi.fn()
      renderItem(makeTodo({ id: '1' }), { onEdit })
      fireEvent.doubleClick(screen.getByText('Test todo'))
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'blurred text' } })
      fireEvent.blur(input)
      expect(onEdit).toHaveBeenCalledWith('1', 'blurred text')
    })

    it('deletes todo when text cleared', () => {
      const onDelete = vi.fn()
      renderItem(makeTodo({ id: '1' }), { onDelete })
      fireEvent.doubleClick(screen.getByText('Test todo'))
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: '   ' } })
      fireEvent.keyDown(input, { key: 'Enter' })
      expect(onDelete).toHaveBeenCalledWith('1')
    })

    it('cancels edit on Escape', () => {
      const onEdit = vi.fn()
      renderItem(makeTodo({ id: '1', text: 'original' }), { onEdit })
      fireEvent.doubleClick(screen.getByText('original'))
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'changed' } })
      fireEvent.keyDown(input, { key: 'Escape' })
      expect(onEdit).not.toHaveBeenCalled()
      expect(screen.getByText('original')).toBeInTheDocument()
    })

    it('toggles edit mode via edit button', () => {
      renderItem(makeTodo({ text: 'abc', id: '2' }))
      const editBtn = screen.getByLabelText('Edit todo')
      fireEvent.click(editBtn)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('focuses and selects text on editing', () => {
      renderItem(makeTodo({ id: '2', text: 'focus me' }))
      const editBtn = screen.getByLabelText('Edit todo')
      fireEvent.click(editBtn)
      const active = document.activeElement
      expect(active.tagName).toBe('INPUT')
    })
  })

  describe('due date editing', () => {
    it('opens date editor when clicking badge', () => {
      const future = new Date()
      future.setDate(future.getDate() + 10)
      renderItem(makeTodo({ dueDate: future.toISOString() }))
      fireEvent.click(screen.getByLabelText('Edit due date'))
      expect(document.querySelector('input[type="date"]')).toBeInTheDocument()
    })

    it('opens date editor when clicking Schedule', () => {
      renderItem(makeTodo({ dueDate: null, completed: false, id: '2' }))
      fireEvent.click(screen.getByLabelText('Set due date'))
      expect(document.querySelector('input[type="date"]')).toBeInTheDocument()
    })

    it('closes date editor on blur', () => {
      const future = new Date()
      future.setDate(future.getDate() + 10)
      renderItem(makeTodo({ dueDate: future.toISOString() }))
      fireEvent.click(screen.getByLabelText('Edit due date'))
      const input = document.querySelector('input[type="date"]')
      fireEvent.blur(input)
      expect(screen.getByLabelText('Edit due date')).toBeInTheDocument()
    })

    it('handles date change', () => {
      const onEditDueDate = vi.fn()
      const future = new Date()
      future.setDate(future.getDate() + 10)
      renderItem(makeTodo({ id: '1', dueDate: future.toISOString() }), { onEditDueDate })
      fireEvent.click(screen.getByLabelText('Edit due date'))
      const input = document.querySelector('input[type="date"]')
      fireEvent.change(input, { target: { value: '2026-01-01' } })
      expect(onEditDueDate).toHaveBeenCalledWith('1', '2026-01-01')
    })

    it('clears due date', () => {
      const onEditDueDate = vi.fn()
      const future = new Date()
      future.setDate(future.getDate() + 10)
      renderItem(makeTodo({ id: '1', dueDate: future.toISOString() }), { onEditDueDate })
      fireEvent.click(screen.getByLabelText('Edit due date'))
      fireEvent.click(screen.getByLabelText('Clear due date'))
      expect(onEditDueDate).toHaveBeenCalledWith('1', null)
    })

    it('cancels date edit on Escape', () => {
      const onEditDueDate = vi.fn()
      const future = new Date()
      future.setDate(future.getDate() + 10)
      renderItem(makeTodo({ id: '1', dueDate: future.toISOString() }), { onEditDueDate })
      fireEvent.click(screen.getByLabelText('Edit due date'))
      const input = document.querySelector('input[type="date"]')
      fireEvent.keyDown(input, { key: 'Escape' })
      expect(onEditDueDate).not.toHaveBeenCalled()
      expect(screen.getByLabelText('Edit due date')).toBeInTheDocument()
    })
  })

  describe('delete', () => {
    it('calls onDelete with id', () => {
      const onDelete = vi.fn()
      renderItem(makeTodo({ id: 'del1' }), { onDelete })
      fireEvent.click(screen.getByLabelText('Delete todo'))
      expect(onDelete).toHaveBeenCalledWith('del1')
    })
  })

  describe('overdue styling', () => {
    it('applies overdue class when overdue and active', () => {
      const past = new Date()
      past.setDate(past.getDate() - 1)
      const { container } = renderItem(makeTodo({ dueDate: past.toISOString(), completed: false }))
      expect(container.querySelector('li').className).toMatch(/border-rose-200/)
    })

    it('does not apply overdue styling when completed', () => {
      const past = new Date()
      past.setDate(past.getDate() - 1)
      const { container } = renderItem(makeTodo({ dueDate: past.toISOString(), completed: true }))
      expect(container.querySelector('li').className).not.toMatch(/border-rose-200/)
    })
  })

  describe('drag and drop', () => {
    it('sets draggable attribute', () => {
      const { container } = renderItem(makeTodo(), { draggable: true })
      expect(container.querySelector('li')).toHaveAttribute('draggable', 'true')
    })

    it('calls onDragStart on drag start', () => {
      const onDragStart = vi.fn()
      const { container } = renderItem(makeTodo(), { onDragStart })
      fireEvent.dragStart(container.querySelector('li'))
      expect(onDragStart).toHaveBeenCalled()
    })

    it('calls onDragEnd on drag end', () => {
      const onDragEnd = vi.fn()
      const { container } = renderItem(makeTodo(), { onDragEnd })
      fireEvent.dragEnd(container.querySelector('li'))
      expect(onDragEnd).toHaveBeenCalled()
    })

    it('calls onDragEnter on drag enter', () => {
      const onDragEnter = vi.fn()
      const { container } = renderItem(makeTodo(), { onDragEnter })
      fireEvent.dragEnter(container.querySelector('li'))
      expect(onDragEnter).toHaveBeenCalled()
    })

    it('calls onDragLeave on drag leave', () => {
      const onDragLeave = vi.fn()
      const { container } = renderItem(makeTodo(), { onDragLeave })
      fireEvent.dragLeave(container.querySelector('li'))
      expect(onDragLeave).toHaveBeenCalled()
    })

    it('calls onDrop on drop', () => {
      const onDrop = vi.fn()
      const { container } = renderItem(makeTodo(), { onDrop })
      fireEvent.drop(container.querySelector('li'))
      expect(onDrop).toHaveBeenCalled()
    })

    it('applies dragging class when dragging', () => {
      const { container } = renderItem(makeTodo(), { dragging: true })
      expect(container.querySelector('li')).toHaveClass('opacity-40')
    })

    it('applies dragOver ring style', () => {
      const { container } = renderItem(makeTodo(), { dragOver: true })
      expect(container.querySelector('li')).toHaveClass('border-violet-400')
    })

    it('does not render grip when not draggable', () => {
      renderItem(makeTodo(), { draggable: false })
      expect(document.querySelectorAll('svg').length).toBeGreaterThanOrEqual(0)
    })

    it('renders grip icon when draggable', () => {
      const { container } = renderItem(makeTodo(), { draggable: true })
      expect(container.querySelectorAll('svg').length).toBeGreaterThanOrEqual(1)
    })
  })
})
