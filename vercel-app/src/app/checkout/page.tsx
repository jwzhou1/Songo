'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  TextField,
  FormControlLabel,
  Checkbox,
  Chip
} from '@mui/material'
import {
  Payment as PaymentIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  LocalShipping as ShippingIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { PaymentService } from '@/services/PaymentService'
import toast from 'react-hot-toast'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const steps = ['Review Order', 'Payment Details', 'Confirmation']

interface CheckoutFormProps {
  selectedQuote: any
  shipmentRequest: any
  onPaymentSuccess: (paymentResult: any) => void
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ 
  selectedQuote, 
  shipmentRequest, 
  onPaymentSuccess 
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [billingDetails, setBillingDetails] = useState({
    name: shipmentRequest?.origin?.name || '',
    email: shipmentRequest?.origin?.email || '',
    phone: shipmentRequest?.origin?.phone || '',
    address: {
      line1: shipmentRequest?.origin?.address || '',
      city: shipmentRequest?.origin?.city || '',
      state: shipmentRequest?.origin?.state || '',
      postal_code: shipmentRequest?.origin?.zip || '',
      country: 'US'
    }
  })
  const [savePaymentMethod, setSavePaymentMethod] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const paymentService = new PaymentService()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      toast.error('Stripe has not loaded yet')
      return
    }

    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions')
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      toast.error('Card element not found')
      return
    }

    setProcessing(true)

    try {
      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: billingDetails
      })

      if (paymentMethodError) {
        throw new Error(paymentMethodError.message)
      }

      // Process payment
      const paymentResult = await paymentService.processPayment({
        amount: selectedQuote.price + calculateTax(selectedQuote.price),
        currency: selectedQuote.currency,
        paymentMethodId: paymentMethod.id,
        savePaymentMethod,
        billing: billingDetails,
        metadata: {
          quoteId: selectedQuote.id,
          carrier: selectedQuote.carrier,
          service: selectedQuote.service,
          trackingNumber: generateTrackingNumber()
        }
      })

      if (paymentResult.success) {
        onPaymentSuccess({
          ...paymentResult,
          trackingNumber: generateTrackingNumber(),
          quote: selectedQuote,
          shipment: shipmentRequest
        })
        toast.success('Payment successful!')
      } else {
        throw new Error(paymentResult.error?.message || 'Payment failed')
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error(error instanceof Error ? error.message : 'Payment failed')
    } finally {
      setProcessing(false)
    }
  }

  const calculateTax = (amount: number) => {
    return Math.round(amount * 0.08 * 100) / 100 // 8% tax
  }

  const calculateTotal = () => {
    const subtotal = selectedQuote.price
    const tax = calculateTax(subtotal)
    const processingFee = paymentService.calculateProcessingFee(subtotal + tax)
    return subtotal + tax + processingFee
  }

  const generateTrackingNumber = () => {
    return `SG${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: '"Roboto", sans-serif',
        fontSmoothing: 'antialiased',
      },
      invalid: {
        color: '#9e2146',
        iconColor: '#9e2146'
      },
      complete: {
        color: '#4caf50',
        iconColor: '#4caf50'
      }
    },
    hidePostalCode: false
  }

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={4}>
        {/* Order Summary */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              💳 Payment Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={billingDetails.name}
                  onChange={(e) => setBillingDetails({
                    ...billingDetails,
                    name: e.target.value
                  })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={billingDetails.email}
                  onChange={(e) => setBillingDetails({
                    ...billingDetails,
                    email: e.target.value
                  })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={billingDetails.phone}
                  onChange={(e) => setBillingDetails({
                    ...billingDetails,
                    phone: e.target.value
                  })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={billingDetails.address.line1}
                  onChange={(e) => setBillingDetails({
                    ...billingDetails,
                    address: { ...billingDetails.address, line1: e.target.value }
                  })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="City"
                  value={billingDetails.address.city}
                  onChange={(e) => setBillingDetails({
                    ...billingDetails,
                    address: { ...billingDetails.address, city: e.target.value }
                  })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="State"
                  value={billingDetails.address.state}
                  onChange={(e) => setBillingDetails({
                    ...billingDetails,
                    address: { ...billingDetails.address, state: e.target.value }
                  })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="ZIP Code"
                  value={billingDetails.address.postal_code}
                  onChange={(e) => setBillingDetails({
                    ...billingDetails,
                    address: { ...billingDetails.address, postal_code: e.target.value }
                  })}
                  required
                />
              </Grid>
            </Grid>

            <Box mt={3}>
              <Typography variant="subtitle1" gutterBottom>
                Card Information
              </Typography>
              <Box
                sx={{
                  p: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  '& .StripeElement': {
                    height: '40px',
                    padding: '10px 12px',
                    color: '#32325d',
                    backgroundColor: 'white',
                    border: '1px solid transparent',
                    borderRadius: '4px',
                    boxShadow: '0 1px 3px 0 #e6ebf1',
                    transition: 'box-shadow 150ms ease'
                  },
                  '& .StripeElement--focus': {
                    boxShadow: '0 1px 3px 0 #cfd7df'
                  },
                  '& .StripeElement--invalid': {
                    borderColor: '#fa755a'
                  },
                  '& .StripeElement--webkit-autofill': {
                    backgroundColor: '#fefde5'
                  }
                }}
              >
                <CardElement options={cardElementOptions} />
              </Box>
              <div id="card-errors" role="alert" style={{ 
                color: '#fa755a', 
                fontSize: '14px', 
                marginTop: '8px',
                display: 'none'
              }} />
            </Box>

            <Box mt={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={savePaymentMethod}
                    onChange={(e) => setSavePaymentMethod(e.target.checked)}
                  />
                }
                label="Save payment method for future use"
              />
            </Box>

            <Box mt={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    required
                  />
                }
                label="I agree to the Terms of Service and Privacy Policy"
              />
            </Box>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <SecurityIcon fontSize="small" />
                <Typography variant="body2">
                  Your payment information is encrypted and secure. We use Stripe for PCI DSS compliant payment processing.
                </Typography>
              </Box>
            </Alert>
          </Paper>
        </Grid>

        {/* Order Summary Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              📋 Order Summary
            </Typography>

            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Typography variant="h4">
                    {selectedQuote.carrier === 'FedEx' ? '🚚' : 
                     selectedQuote.carrier === 'UPS' ? '📦' : 
                     selectedQuote.carrier === 'DHL' ? '✈️' : '📮'}
                  </Typography>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {selectedQuote.carrier}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedQuote.service}
                    </Typography>
                  </Box>
                </Box>
                
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Transit Time:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {selectedQuote.transitDays} {selectedQuote.transitDays === 1 ? 'day' : 'days'}
                  </Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Delivery Date:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {new Date(selectedQuote.deliveryDate).toLocaleDateString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            <Box sx={{ '& > div': { mb: 1 } }}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Shipping:</Typography>
                <Typography variant="body2">${selectedQuote.price.toFixed(2)}</Typography>
              </Box>
              
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Tax (8%):</Typography>
                <Typography variant="body2">${calculateTax(selectedQuote.price).toFixed(2)}</Typography>
              </Box>
              
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Processing Fee:</Typography>
                <Typography variant="body2">
                  ${paymentService.calculateProcessingFee(selectedQuote.price + calculateTax(selectedQuote.price)).toFixed(2)}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box display="flex" justifyContent="space-between">
                <Typography variant="h6" fontWeight="bold">Total:</Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  ${calculateTotal().toFixed(2)} {selectedQuote.currency}
                </Typography>
              </Box>
            </Box>

            <Box mt={3}>
              <Typography variant="subtitle2" gutterBottom>
                Included Features:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={0.5}>
                {selectedQuote.features.map((feature: string, index: number) => (
                  <Chip
                    key={index}
                    label={feature}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem' }}
                  />
                ))}
              </Box>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={!stripe || processing || !agreedToTerms}
              startIcon={processing ? <CircularProgress size={20} /> : <PaymentIcon />}
              sx={{
                mt: 3,
                py: 1.5,
                fontSize: '1.1rem',
                background: 'linear-gradient(45deg, #4caf50 30%, #45a049 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #45a049 30%, #3d8b40 90%)',
                },
                '&:disabled': {
                  background: '#ccc'
                }
              }}
            >
              {processing ? 'Processing...' : `Pay $${calculateTotal().toFixed(2)}`}
            </Button>

            <Box mt={2} textAlign="center">
              <Typography variant="caption" color="text.secondary">
                Powered by Stripe • Secure & Encrypted
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </form>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const [activeStep, setActiveStep] = useState(1)
  const [selectedQuote, setSelectedQuote] = useState<any>(null)
  const [shipmentRequest, setShipmentRequest] = useState<any>(null)
  const [paymentResult, setPaymentResult] = useState<any>(null)

  useEffect(() => {
    // Get quote and shipment data from session storage
    const quote = sessionStorage.getItem('selectedQuote')
    const request = sessionStorage.getItem('shipmentRequest')
    
    if (quote && request) {
      setSelectedQuote(JSON.parse(quote))
      setShipmentRequest(JSON.parse(request))
    } else {
      // Redirect to quote page if no data
      router.push('/get-quote')
    }
  }, [router])

  const handlePaymentSuccess = (result: any) => {
    setPaymentResult(result)
    setActiveStep(2)
    
    // Store result for confirmation page
    sessionStorage.setItem('paymentResult', JSON.stringify(result))
    
    // Clear quote data
    sessionStorage.removeItem('selectedQuote')
    sessionStorage.removeItem('shipmentRequest')
  }

  const handleViewTracking = () => {
    if (paymentResult?.trackingNumber) {
      router.push(`/tracking?number=${paymentResult.trackingNumber}`)
    }
  }

  const handleNewShipment = () => {
    router.push('/get-quote')
  }

  if (!selectedQuote || !shipmentRequest) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading checkout...
        </Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom textAlign="center" sx={{ mb: 2 }}>
        💳 Secure Checkout
      </Typography>
      <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
        Complete your shipping payment with enterprise-grade security
      </Typography>

      {/* Progress Stepper */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <AnimatePresence mode="wait">
        {activeStep === 1 && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Elements stripe={stripePromise}>
              <CheckoutForm
                selectedQuote={selectedQuote}
                shipmentRequest={shipmentRequest}
                onPaymentSuccess={handlePaymentSuccess}
              />
            </Elements>
          </motion.div>
        )}

        {activeStep === 2 && paymentResult && (
          <motion.div
            key="confirmation"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
              
              <Typography variant="h4" gutterBottom color="success.main">
                Payment Successful!
              </Typography>
              
              <Typography variant="h6" color="text.secondary" paragraph>
                Your shipment has been booked and payment processed successfully.
              </Typography>

              <Card sx={{ maxWidth: 500, mx: 'auto', mb: 4 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    📦 Shipment Details
                  </Typography>
                  
                  <Box sx={{ '& > div': { mb: 1 } }}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Tracking Number:</Typography>
                      <Typography variant="body2" fontWeight="bold" fontFamily="monospace">
                        {paymentResult.trackingNumber}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Carrier:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {selectedQuote.carrier} {selectedQuote.service}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Amount Paid:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        ${paymentResult.amount.toFixed(2)} {paymentResult.currency}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Payment ID:</Typography>
                      <Typography variant="body2" fontWeight="bold" fontFamily="monospace">
                        {paymentResult.paymentIntentId}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              <Alert severity="success" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
                <Typography variant="body2">
                  📧 Confirmation email sent to {shipmentRequest.origin.email}
                  <br />
                  📱 SMS updates will be sent to {shipmentRequest.origin.phone}
                </Typography>
              </Alert>

              <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleViewTracking}
                  startIcon={<ShippingIcon />}
                  sx={{
                    px: 4,
                    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  }}
                >
                  Track Package
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleNewShipment}
                  startIcon={<ReceiptIcon />}
                  sx={{ px: 4 }}
                >
                  New Shipment
                </Button>
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  )
}
