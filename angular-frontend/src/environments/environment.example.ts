export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  
  // Demo mode - all APIs are mocked
  demoMode: true,
  
  // External API Keys (not required for demo)
  stripePublishableKey: 'pk_test_demo_key',
  googleMapsApiKey: 'demo_google_maps_key',
  
  // Feature flags
  features: {
    realTimeTracking: true,
    paymentProcessing: false, // Demo mode
    multiCarrierIntegration: false, // Demo mode
    userAuthentication: false, // Demo mode
  },
  
  // Mock data configuration
  mockData: {
    enableMockQuotes: true,
    enableMockTracking: true,
    enableMockAuth: true,
    simulateApiDelay: 1500, // milliseconds
  }
};
