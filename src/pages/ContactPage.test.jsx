import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ContactPage } from './ContactPage.jsx'

function renderContact() {
  return render(
    <MemoryRouter>
      <ContactPage />
    </MemoryRouter>
  )
}

describe('ContactPage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the Contact Us badge', () => {
    renderContact()
    expect(screen.getByText('Contact Us')).toBeInTheDocument()
  })

  it('renders the main heading', () => {
    renderContact()
    expect(screen.getByRole('heading', { name: /to hear from you/ })).toBeInTheDocument()
  })

  it('renders the contact form', () => {
    renderContact()
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Message')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send message' })).toBeInTheDocument()
  })

  it('shows error when submitting empty form', () => {
    renderContact()
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    expect(screen.getByText('Please fill in all fields')).toBeInTheDocument()
  })

  it('shows success message after submitting the form', () => {
    renderContact()
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Jane Doe' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jane@example.com' } })
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Hello TaskFlow!' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    act(() => {
      vi.advanceTimersByTime(700)
    })
    expect(screen.getByText('Message sent')).toBeInTheDocument()
    expect(screen.getByText(/Thanks for reaching out/)).toBeInTheDocument()
  })

  it('clears error after filling the form', () => {
    renderContact()
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    expect(screen.getByText('Please fill in all fields')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Jane Doe' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jane@example.com' } })
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Hello TaskFlow!' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    expect(screen.queryByText('Please fill in all fields')).toBeNull()
  })

  it('links back to home', () => {
    renderContact()
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/')
  })
})