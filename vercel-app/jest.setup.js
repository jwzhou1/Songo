// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock environment variables
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_mock_key'
process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'mock_google_maps_key'
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null
  }
  disconnect() {
    return null
  }
  unobserve() {
    return null
  }
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null
  }
  disconnect() {
    return null
  }
  unobserve() {
    return null
  }
}

// Mock Google Maps
global.google = {
  maps: {
    Map: jest.fn(() => ({
      setCenter: jest.fn(),
      setZoom: jest.fn(),
      fitBounds: jest.fn(),
      getZoom: jest.fn(() => 10),
      setMapTypeId: jest.fn(),
    })),
    Marker: jest.fn(() => ({
      setMap: jest.fn(),
      addListener: jest.fn(),
      getPosition: jest.fn(() => ({ lat: () => 0, lng: () => 0 })),
    })),
    InfoWindow: jest.fn(() => ({
      open: jest.fn(),
      close: jest.fn(),
    })),
    LatLngBounds: jest.fn(() => ({
      extend: jest.fn(),
    })),
    DirectionsService: jest.fn(() => ({
      route: jest.fn(),
    })),
    DirectionsRenderer: jest.fn(() => ({
      setMap: jest.fn(),
      setDirections: jest.fn(),
    })),
    Polyline: jest.fn(() => ({
      setMap: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
    })),
    SymbolPath: {
      FORWARD_CLOSED_ARROW: 'FORWARD_CLOSED_ARROW',
    },
    MapTypeId: {
      ROADMAP: 'roadmap',
      SATELLITE: 'satellite',
      HYBRID: 'hybrid',
      TERRAIN: 'terrain',
    },
    Animation: {
      DROP: 'DROP',
      BOUNCE: 'BOUNCE',
    },
    DirectionsStatus: {
      OK: 'OK',
    },
    TravelMode: {
      DRIVING: 'DRIVING',
    },
    event: {
      addListenerOnce: jest.fn(),
    },
  },
}

// Mock Stripe
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() =>
    Promise.resolve({
      elements: jest.fn(() => ({
        create: jest.fn(() => ({
          mount: jest.fn(),
          destroy: jest.fn(),
          on: jest.fn(),
        })),
      })),
      createPaymentMethod: jest.fn(() =>
        Promise.resolve({
          paymentMethod: { id: 'pm_test_123' },
          error: null,
        })
      ),
      confirmCardPayment: jest.fn(() =>
        Promise.resolve({
          paymentIntent: {
            id: 'pi_test_123',
            status: 'succeeded',
            amount: 2000,
            currency: 'usd',
          },
          error: null,
        })
      ),
    })
  ),
}))

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
)

// Suppress console warnings in tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
