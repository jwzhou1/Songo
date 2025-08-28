export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  
  // Demo mode - connect to real backend
  demoMode: false,
  
  // External API Keys (not required for demo)
  stripePublishableKey: 'pk_test_demo_key',
  googleMapsApiKey: 'demo_google_maps_key',
  
  // Feature flags
  features: {
    realTimeTracking: true,
    paymentProcessing: true, // Enable real payment processing
    multiCarrierIntegration: true, // Enable real carrier integration
    userAuthentication: true, // Enable real authentication
  },
  
  // Mock data configuration
  mockData: {
    enableMockQuotes: false,
    enableMockTracking: false,
    enableMockAuth: false,
    simulateApiDelay: 0, // No delay for real API
  }
};
