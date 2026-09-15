import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AboutPage } from './AboutPage.jsx'

function renderAbout() {
  return render(
    <MemoryRouter>
      <AboutPage />
    </MemoryRouter>
  )
}

describe('AboutPage', () => {
  it('renders the About badge', () => {
    renderAbout()
    expect(screen.getByText('About TaskFlow')).toBeInTheDocument()
  })

  it('renders the main heading', () => {
    renderAbout()
    expect(screen.getByRole('heading', { name: 'Your tasks, your rules' })).toBeInTheDocument()
  })

  it('renders the description', () => {
    renderAbout()
    expect(screen.getByText(/offline-first task manager/)).toBeInTheDocument()
  })

  it('renders all values cards', () => {
    renderAbout()
    expect(screen.getByText('Offline-First')).toBeInTheDocument()
    expect(screen.getByText('Privacy by Design')).toBeInTheDocument()
    expect(screen.getByText('Beautifully Simple')).toBeInTheDocument()
  })

  it('renders the call to action section', () => {
    renderAbout()
    expect(screen.getByText('See TaskFlow in action')).toBeInTheDocument()
  })

  it('links back to home', () => {
    renderAbout()
    const homeLinks = screen.getAllByRole('link', { name: 'Back to home' })
    expect(homeLinks[0]).toHaveAttribute('href', '/')
  })

  it('links to signup', () => {
    renderAbout()
    expect(screen.getByRole('link', { name: 'Get started' })).toHaveAttribute('href', '/signup')
  })
})