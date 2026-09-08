import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Icon } from './icons.jsx'
import { ICONS } from './iconPaths.js'

describe('Icon', () => {
  it('renders an svg with a path', () => {
    render(<Icon path={ICONS.check} />)
    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg.querySelector('path')).toHaveAttribute('d', ICONS.check)
  })

  it('applies default className', () => {
    render(<Icon path={ICONS.x} />)
    expect(document.querySelector('svg')).toHaveClass('w-4 h-4')
  })

  it('applies custom className', () => {
    render(<Icon path={ICONS.x} className="custom-size" />)
    expect(document.querySelector('svg')).toHaveClass('custom-size')
  })

  it('applies custom strokeWidth', () => {
    render(<Icon path={ICONS.trash} strokeWidth={3} />)
    expect(document.querySelector('svg')).toHaveAttribute('stroke-width', '3')
  })
})

describe('ICONS', () => {
  it('contains all expected icon paths', () => {
    const keys = ['edit', 'trash', 'calendar', 'plus', 'check', 'x', 'sun', 'moon', 'sparkles', 'grip']
    keys.forEach((k) => {
      expect(typeof ICONS[k]).toBe('string')
      expect(ICONS[k].length).toBeGreaterThan(0)
    })
  })
})
