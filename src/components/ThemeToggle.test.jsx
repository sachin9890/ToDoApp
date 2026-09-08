import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ThemeToggle from './ThemeToggle.jsx'

describe('ThemeToggle', () => {
  it('renders with aria-checked false for light mode', () => {
    render(<ThemeToggle dark={false} onToggle={vi.fn()} />)
    const btn = screen.getByRole('switch')
    expect(btn).toHaveAttribute('aria-checked', 'false')
    expect(btn).toHaveAttribute('aria-label', 'Switch to dark mode')
  })

  it('renders with aria-checked true for dark mode', () => {
    render(<ThemeToggle dark={true} onToggle={vi.fn()} />)
    const btn = screen.getByRole('switch')
    expect(btn).toHaveAttribute('aria-checked', 'true')
    expect(btn).toHaveAttribute('aria-label', 'Switch to light mode')
  })

  it('calls onToggle when clicked', () => {
    const onToggle = vi.fn()
    render(<ThemeToggle dark={false} onToggle={onToggle} />)
    fireEvent.click(screen.getByRole('switch'))
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('applies translate-x-7 to knob in dark mode', () => {
    const { container } = render(<ThemeToggle dark={true} onToggle={vi.fn()} />)
    const knob = container.querySelector('span.block')
    expect(knob).toHaveClass('translate-x-7')
  })

  it('applies translate-x-0 to knob in light mode', () => {
    const { container } = render(<ThemeToggle dark={false} onToggle={vi.fn()} />)
    const knob = container.querySelector('span.block')
    expect(knob).toHaveClass('translate-x-0')
  })

  it('renders sun and moon icons', () => {
    render(<ThemeToggle dark={false} onToggle={vi.fn()} />)
    expect(document.querySelectorAll('svg').length).toBe(2)
  })
})
