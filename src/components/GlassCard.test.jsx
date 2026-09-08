import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import GlassCard from './GlassCard.jsx'

describe('GlassCard', () => {
  it('renders children', () => {
    render(<GlassCard>Hello World</GlassCard>)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('applies default className', () => {
    const { container } = render(<GlassCard>content</GlassCard>)
    expect(container.firstChild).toHaveClass('rounded-2xl')
  })

  it('applies custom className', () => {
    const { container } = render(<GlassCard className="p-4">content</GlassCard>)
    expect(container.firstChild).toHaveClass('p-4')
  })

  it('merges custom and default classes', () => {
    const { container } = render(<GlassCard className="custom-class">content</GlassCard>)
    expect(container.firstChild).toHaveClass('rounded-2xl')
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
