import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import { theme } from '@/theme/theme'
import HomePage from '../page'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock react-intersection-observer
jest.mock('react-intersection-observer', () => ({
  useInView: () => [null, true],
}))

// Mock react-countup
jest.mock('react-countup', () => {
  return function CountUp({ end, suffix }: { end: number; suffix?: string }) {
    return <span>{end}{suffix}</span>
  }
})

// Mock components that might not be available in test environment
jest.mock('@/components/home/HeroSection', () => {
  return function HeroSection() {
    return <div data-testid="hero-section">Hero Section</div>
  }
})

jest.mock('@/components/home/FeaturesSection', () => {
  return function FeaturesSection() {
    return <div data-testid="features-section">Features Section</div>
  }
})

jest.mock('@/components/home/StatsSection', () => {
  return function StatsSection() {
    return <div data-testid="stats-section">Stats Section</div>
  }
})

jest.mock('@/components/home/CarriersSection', () => {
  return function CarriersSection() {
    return <div data-testid="carriers-section">Carriers Section</div>
  }
})

jest.mock('@/components/home/TestimonialsSection', () => {
  return function TestimonialsSection() {
    return <div data-testid="testimonials-section">Testimonials Section</div>
  }
})

jest.mock('@/components/home/CTASection', () => {
  return function CTASection() {
    return <div data-testid="cta-section">CTA Section</div>
  }
})

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  )
}

describe('HomePage', () => {
  it('renders without crashing', () => {
    renderWithTheme(<HomePage />)
    expect(screen.getByText('Enterprise Shipping')).toBeInTheDocument()
  })

  it('displays the main heading', () => {
    renderWithTheme(<HomePage />)
    expect(screen.getByText('Enterprise Shipping')).toBeInTheDocument()
    expect(screen.getByText('Made Simple')).toBeInTheDocument()
  })

  it('displays the subtitle', () => {
    renderWithTheme(<HomePage />)
    expect(screen.getByText(/Real-time multi-carrier quotes/)).toBeInTheDocument()
  })

  it('displays action buttons', () => {
    renderWithTheme(<HomePage />)
    expect(screen.getByText('Get Quote')).toBeInTheDocument()
    expect(screen.getByText('Track Package')).toBeInTheDocument()
  })

  it('displays statistics section', () => {
    renderWithTheme(<HomePage />)
    expect(screen.getByText('50000+')).toBeInTheDocument()
    expect(screen.getByText('Shipments Processed')).toBeInTheDocument()
  })

  it('displays features section', () => {
    renderWithTheme(<HomePage />)
    expect(screen.getByText('Enterprise Features')).toBeInTheDocument()
    expect(screen.getByText('Multi-Carrier Integration')).toBeInTheDocument()
  })

  it('displays carriers section', () => {
    renderWithTheme(<HomePage />)
    expect(screen.getByText('Trusted Carrier Partners')).toBeInTheDocument()
    expect(screen.getByText('FedEx')).toBeInTheDocument()
    expect(screen.getByText('UPS')).toBeInTheDocument()
    expect(screen.getByText('DHL')).toBeInTheDocument()
    expect(screen.getByText('USPS')).toBeInTheDocument()
  })

  it('displays CTA section', () => {
    renderWithTheme(<HomePage />)
    expect(screen.getByText('Ready to Transform Your Shipping?')).toBeInTheDocument()
    expect(screen.getByText('Start Free Trial')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    renderWithTheme(<HomePage />)
    const mainHeading = screen.getByRole('heading', { level: 1 })
    expect(mainHeading).toBeInTheDocument()
    expect(mainHeading).toHaveTextContent('Enterprise Shipping')
  })
})
