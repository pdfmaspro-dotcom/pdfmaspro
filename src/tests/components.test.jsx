// ─── Component tests ──────────────────────────────────────────────────────────
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'

// Simple component tests without heavy PDF deps
describe('FileUploader component', () => {
  it('renders drop zone with label', async () => {
    const { FileUploader } = await import('../components/FileUploader')
    render(<FileUploader onFileSelect={vi.fn()} accept={{}} label="Drop PDF here" />)
    expect(screen.getByText(/Drop PDF here/i)).toBeInTheDocument()
  })
})

describe('ProgressBar component', () => {
  it('renders with given progress', async () => {
    const { default: ProgressBar } = await import('../components/ProgressBar')
    const { container } = render(<ProgressBar progress={65} />)
    expect(container.firstChild).toBeTruthy()
  })
})

describe('404 page', () => {
  it('renders not found message', async () => {
    const { default: NotFound } = await import('../pages/NotFound')
    render(<HelmetProvider><MemoryRouter><NotFound /></MemoryRouter></HelmetProvider>)
    expect(screen.getByText(/404/i)).toBeInTheDocument()
  })
})
