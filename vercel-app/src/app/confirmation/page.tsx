'use client'

import React, { useEffect, useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  Chip,
  Card,
  CardContent,
  Alert,
  CircularProgress
} from '@mui/material'
import {
  CheckCircle as CheckCircleIcon,
  LocalShipping as ShippingIcon,
  Receipt as ReceiptIcon,
  Email as EmailIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'

interface PaymentDetails {
  paymentIntentId: string
  amount: number
  currency: string
  status: string
  receiptUrl?: string
}

interface ShipmentDetails {
  trackingNumber: string
  carrier: string
  service: string
  estimatedDelivery: string
  origin: {
    name: string
    address: string
    city: string
    state: string
    zip: string
  }
  destination: {
    name: string
    address: string
    city: string
    state: string
    zip: string
  }
}

export default function ConfirmationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null)
  const [shipmentDetails, setShipmentDetails] = useState<ShipmentDetails | null>(null)

  useEffect(() => {
    const paymentIntentId = searchParams.get('payment_intent')
    const trackingNumber = searchParams.get('tracking_number')

    if (!paymentIntentId) {
      toast.error('Invalid confirmation link')
      router.push('/')
      return
    }

    // Load confirmation details
    loadConfirmationDetails(paymentIntentId, trackingNumber)
  }, [searchParams, router])

  const loadConfirmationDetails = async (paymentIntentId: string, trackingNumber: string | null) => {
    try {
      // Mock data for demo - in real app, fetch from API
      const mockPaymentDetails: PaymentDetails = {
        paymentIntentId,
        amount: 45.99,
        currency: 'USD',
        status: 'succeeded',
        receiptUrl: '#'
      }

      const mockShipmentDetails: ShipmentDetails = {
        trackingNumber: trackingNumber || '1Z999AA1234567890',
        carrier: 'UPS',
        service: 'UPS Ground',
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        origin: {
          name: 'John Doe',
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          zip: '10001'
        },
        destination: {
          name: 'Jane Smith',
          address: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zip: '90210'
        }
      }

      setPaymentDetails(mockPaymentDetails)
      setShipmentDetails(mockShipmentDetails)
    } catch (error) {
      toast.error('Failed to load confirmation details')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleTrackPackage = () => {
    if (shipmentDetails) {
      router.push(`/tracking?number=${shipmentDetails.trackingNumber}`)
    }
  }

  const handleDownloadReceipt = () => {
    toast('Receipt download will be implemented soon', { icon: 'ℹ️' })
  }

  const handlePrintLabel = () => {
    toast('Label printing will be implemented soon', { icon: 'ℹ️' })
  }

  const handleShareTracking = () => {
    if (shipmentDetails) {
      const trackingUrl = `${window.location.origin}/tracking?number=${shipmentDetails.trackingNumber}`
      navigator.clipboard.writeText(trackingUrl)
      toast.success('Tracking link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading confirmation details...
        </Typography>
      </Container>
    )
  }

  if (!paymentDetails || !shipmentDetails) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">
          Unable to load confirmation details. Please contact support.
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Success Header */}
        <Box textAlign="center" mb={4}>
          <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
            Payment Successful!
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Your shipment has been created and payment processed
          </Typography>
        </Box>

        {/* Payment Details */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            💳 Payment Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Payment ID
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {paymentDetails.paymentIntentId}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Amount Paid
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                ${paymentDetails.amount.toFixed(2)} {paymentDetails.currency}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Status
              </Typography>
              <Chip
                label={paymentDetails.status.toUpperCase()}
                color="success"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Date
              </Typography>
              <Typography variant="body1">
                {new Date().toLocaleDateString()}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Shipment Details */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            📦 Shipment Details
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Tracking Number
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="primary">
                {shipmentDetails.trackingNumber}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Carrier & Service
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {shipmentDetails.carrier} - {shipmentDetails.service}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Estimated Delivery
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {shipmentDetails.estimatedDelivery}
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                📍 From (Pickup)
              </Typography>
              <Typography variant="body2">
                {shipmentDetails.origin.name}<br />
                {shipmentDetails.origin.address}<br />
                {shipmentDetails.origin.city}, {shipmentDetails.origin.state} {shipmentDetails.origin.zip}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                📍 To (Delivery)
              </Typography>
              <Typography variant="body2">
                {shipmentDetails.destination.name}<br />
                {shipmentDetails.destination.address}<br />
                {shipmentDetails.destination.city}, {shipmentDetails.destination.state} {shipmentDetails.destination.zip}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Action Buttons */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<ShippingIcon />}
              onClick={handleTrackPackage}
              sx={{
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              }}
            >
              Track Package
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ReceiptIcon />}
              onClick={handleDownloadReceipt}
            >
              Download Receipt
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrintLabel}
            >
              Print Label
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ShareIcon />}
              onClick={handleShareTracking}
            >
              Share Tracking
            </Button>
          </Grid>
        </Grid>

        {/* Next Steps */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📋 What's Next?
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                📧 You'll receive email confirmations and tracking updates
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                📦 Your package will be picked up within 1 business day
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                🚚 Track your shipment using the tracking number above
              </Typography>
              <Typography component="li" variant="body2">
                📞 Contact support if you have any questions
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Navigation */}
        <Box textAlign="center" mt={4}>
          <Button
            variant="text"
            onClick={() => router.push('/')}
            sx={{ mr: 2 }}
          >
            Back to Home
          </Button>
          <Button
            variant="text"
            onClick={() => router.push('/get-quote')}
          >
            Create Another Shipment
          </Button>
        </Box>
      </motion.div>
    </Container>
  )
}
