'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  LocalShipping as ShippingIcon,
  ExpandMore as ExpandMoreIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Nature as EcoIcon,
  Star as StarIcon,
  Info as InfoIcon,
  Compare as CompareIcon,
  Payment as PaymentIcon
} from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { motion, AnimatePresence } from 'framer-motion'
import { CarrierService, ShipmentRequest, CarrierQuote } from '@/services/CarrierService'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const schema = yup.object({
  origin: yup.object({
    name: yup.string().required('Name is required'),
    company: yup.string(),
    address: yup.string().required('Address is required'),
    city: yup.string().required('City is required'),
    state: yup.string().required('State is required'),
    zip: yup.string().required('ZIP code is required'),
    country: yup.string().required('Country is required'),
    phone: yup.string(),
    email: yup.string().email('Invalid email')
  }),
  destination: yup.object({
    name: yup.string().required('Name is required'),
    company: yup.string(),
    address: yup.string().required('Address is required'),
    city: yup.string().required('City is required'),
    state: yup.string().required('State is required'),
    zip: yup.string().required('ZIP code is required'),
    country: yup.string().required('Country is required'),
    phone: yup.string(),
    email: yup.string().email('Invalid email')
  }),
  packages: yup.array().of(
    yup.object({
      type: yup.string().required('Package type is required'),
      dimensions: yup.object({
        length: yup.number().positive('Length must be positive').required('Length is required'),
        width: yup.number().positive('Width must be positive').required('Width is required'),
        height: yup.number().positive('Height must be positive').required('Height is required'),
        weight: yup.number().positive('Weight must be positive').required('Weight is required'),
        unit: yup.string().required('Unit is required'),
        weightUnit: yup.string().required('Weight unit is required')
      }),
      value: yup.number().positive('Value must be positive').required('Value is required'),
      contents: yup.string().required('Contents description is required')
    })
  ).min(1, 'At least one package is required'),
  serviceLevel: yup.string().required('Service level is required'),
  pickupDate: yup.string().required('Pickup date is required')
})

export default function GetQuotePage() {
  const router = useRouter()
  const [quotes, setQuotes] = useState<CarrierQuote[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState<CarrierQuote | null>(null)
  const [showComparison, setShowComparison] = useState(false)
  const carrierService = new CarrierService()

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<ShipmentRequest>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      origin: {
        name: '',
        company: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        country: 'US',
        phone: '',
        email: ''
      },
      destination: {
        name: '',
        company: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        country: 'US',
        phone: '',
        email: ''
      },
      packages: [{
        type: 'PARCEL',
        dimensions: {
          length: 0,
          width: 0,
          height: 0,
          weight: 0,
          unit: 'IN',
          weightUnit: 'LB'
        },
        value: 0,
        contents: '',
        hazardous: false,
        fragile: false,
        signature: false,
        insurance: false
      }],
      serviceLevel: 'GROUND',
      pickupDate: new Date().toISOString().split('T')[0],
      specialInstructions: '',
      insurance: false,
      signatureRequired: false,
      saturdayDelivery: false,
      residentialDelivery: false
    }
  })

  const packages = watch('packages')

  const onSubmit = async (data: ShipmentRequest) => {
    setLoading(true)
    try {
      const quotesResult = await carrierService.getAllQuotes(data)
      setQuotes(quotesResult)
      
      if (quotesResult.length === 0) {
        toast.error('No quotes available for this shipment')
      } else {
        toast.success(`Found ${quotesResult.length} quotes from carriers`)
        setShowComparison(true)
      }
    } catch (error) {
      console.error('Error getting quotes:', error)
      toast.error('Failed to get quotes. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const addPackage = () => {
    const newPackage = {
      type: 'PARCEL' as const,
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
        weight: 0,
        unit: 'IN' as const,
        weightUnit: 'LB' as const
      },
      value: 0,
      contents: '',
      hazardous: false,
      fragile: false,
      signature: false,
      insurance: false
    }
    setValue('packages', [...packages, newPackage])
  }

  const removePackage = (index: number) => {
    if (packages.length > 1) {
      const updatedPackages = packages.filter((_, i) => i !== index)
      setValue('packages', updatedPackages)
    }
  }

  const handleSelectQuote = (quote: CarrierQuote) => {
    setSelectedQuote(quote)
    // Store quote in session storage for checkout
    sessionStorage.setItem('selectedQuote', JSON.stringify(quote))
    sessionStorage.setItem('shipmentRequest', JSON.stringify(watch()))
  }

  const handleProceedToCheckout = () => {
    if (selectedQuote) {
      router.push('/checkout')
    }
  }

  const getCarrierLogo = (carrier: string) => {
    const logos: { [key: string]: string } = {
      'FedEx': '🚚',
      'UPS': '📦',
      'DHL': '✈️',
      'USPS': '📮'
    }
    return logos[carrier] || '🚛'
  }

  const getServiceIcon = (service: string) => {
    if (service.toLowerCase().includes('overnight') || service.toLowerCase().includes('express')) {
      return <SpeedIcon color="primary" />
    }
    return <ShippingIcon color="action" />
  }

  const formatTransitTime = (days: number) => {
    if (days === 1) return '1 business day'
    return `${days} business days`
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom textAlign="center" sx={{ mb: 4 }}>
        Get Shipping Quote
      </Typography>
      <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
        Compare rates from multiple carriers and find the best shipping solution
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={4}>
          {/* Origin Address */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                🏢 Pickup Address
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Where should we pick up your package?
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="origin.name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Contact Name"
                        error={!!errors.origin?.name}
                        helperText={errors.origin?.name?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="origin.company"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Company (Optional)"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="origin.address"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Street Address"
                        error={!!errors.origin?.address}
                        helperText={errors.origin?.address?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Controller
                    name="origin.city"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="City"
                        error={!!errors.origin?.city}
                        helperText={errors.origin?.city?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Controller
                    name="origin.state"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="State"
                        error={!!errors.origin?.state}
                        helperText={errors.origin?.state?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Controller
                    name="origin.zip"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="ZIP Code"
                        error={!!errors.origin?.zip}
                        helperText={errors.origin?.zip?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="origin.phone"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Phone (Optional)"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="origin.email"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Email (Optional)"
                        type="email"
                        error={!!errors.origin?.email}
                        helperText={errors.origin?.email?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Destination Address */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                🎯 Destination Address
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="destination.name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Contact Name"
                        error={!!errors.destination?.name}
                        helperText={errors.destination?.name?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="destination.company"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Company (Optional)"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="destination.address"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Street Address"
                        error={!!errors.destination?.address}
                        helperText={errors.destination?.address?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Controller
                    name="destination.city"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="City"
                        error={!!errors.destination?.city}
                        helperText={errors.destination?.city?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Controller
                    name="destination.state"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="State"
                        error={!!errors.destination?.state}
                        helperText={errors.destination?.state?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Controller
                    name="destination.zip"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="ZIP Code"
                        error={!!errors.destination?.zip}
                        helperText={errors.destination?.zip?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="destination.phone"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Phone (Optional)"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="destination.email"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Email (Optional)"
                        type="email"
                        error={!!errors.destination?.email}
                        helperText={errors.destination?.email?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Package Information */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  📦 Package Information
                </Typography>
                <Button
                  variant="outlined"
                  onClick={addPackage}
                  startIcon={<ShippingIcon />}
                >
                  Add Package
                </Button>
              </Box>

              {packages.map((pkg, index) => (
                <Accordion key={index} defaultExpanded={index === 0}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Package {index + 1}</Typography>
                    {packages.length > 1 && (
                      <Button
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation()
                          removePackage(index)
                        }}
                        sx={{ ml: 'auto', mr: 2 }}
                      >
                        Remove
                      </Button>
                    )}
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name={`packages.${index}.type`}
                          control={control}
                          render={({ field }) => (
                            <FormControl fullWidth>
                              <InputLabel>Package Type</InputLabel>
                              <Select {...field} label="Package Type">
                                <MenuItem value="PARCEL">Parcel</MenuItem>
                                <MenuItem value="PALLET">Pallet</MenuItem>
                                <MenuItem value="ENVELOPE">Envelope</MenuItem>
                                <MenuItem value="BOX">Box</MenuItem>
                              </Select>
                            </FormControl>
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name={`packages.${index}.contents`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Contents Description"
                              error={!!errors.packages?.[index]?.contents}
                              helperText={errors.packages?.[index]?.contents?.message}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Controller
                          name={`packages.${index}.dimensions.length`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Length"
                              type="number"
                              error={!!errors.packages?.[index]?.dimensions?.length}
                              helperText={errors.packages?.[index]?.dimensions?.length?.message}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Controller
                          name={`packages.${index}.dimensions.width`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Width"
                              type="number"
                              error={!!errors.packages?.[index]?.dimensions?.width}
                              helperText={errors.packages?.[index]?.dimensions?.width?.message}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Controller
                          name={`packages.${index}.dimensions.height`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Height"
                              type="number"
                              error={!!errors.packages?.[index]?.dimensions?.height}
                              helperText={errors.packages?.[index]?.dimensions?.height?.message}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Controller
                          name={`packages.${index}.dimensions.unit`}
                          control={control}
                          render={({ field }) => (
                            <FormControl fullWidth>
                              <InputLabel>Unit</InputLabel>
                              <Select {...field} label="Unit">
                                <MenuItem value="IN">Inches</MenuItem>
                                <MenuItem value="CM">Centimeters</MenuItem>
                              </Select>
                            </FormControl>
                          )}
                        />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Controller
                          name={`packages.${index}.dimensions.weight`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Weight"
                              type="number"
                              error={!!errors.packages?.[index]?.dimensions?.weight}
                              helperText={errors.packages?.[index]?.dimensions?.weight?.message}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Controller
                          name={`packages.${index}.dimensions.weightUnit`}
                          control={control}
                          render={({ field }) => (
                            <FormControl fullWidth>
                              <InputLabel>Weight Unit</InputLabel>
                              <Select {...field} label="Weight Unit">
                                <MenuItem value="LB">Pounds</MenuItem>
                                <MenuItem value="KG">Kilograms</MenuItem>
                              </Select>
                            </FormControl>
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name={`packages.${index}.value`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Declared Value ($)"
                              type="number"
                              error={!!errors.packages?.[index]?.value}
                              helperText={errors.packages?.[index]?.value?.message}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Paper>
          </Grid>

          {/* Shipping Options */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                🚚 Shipping Options
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="serviceLevel"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Service Level</InputLabel>
                        <Select {...field} label="Service Level">
                          <MenuItem value="ECONOMY">Economy</MenuItem>
                          <MenuItem value="GROUND">Ground</MenuItem>
                          <MenuItem value="EXPRESS">Express</MenuItem>
                          <MenuItem value="OVERNIGHT">Overnight</MenuItem>
                          <MenuItem value="INTERNATIONAL">International</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="pickupDate"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Pickup Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.pickupDate}
                        helperText={errors.pickupDate?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Box textAlign="center">
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <CompareIcon />}
                sx={{
                  px: 6,
                  py: 2,
                  fontSize: '1.1rem',
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                  }
                }}
              >
                {loading ? 'Getting Quotes...' : 'Get Quotes'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>

      {/* Quotes Results */}
      <AnimatePresence>
        {showComparison && quotes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
          >
            <Box mt={6}>
              <Typography variant="h4" gutterBottom textAlign="center">
                📊 Compare Quotes
              </Typography>
              <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>
                Found {quotes.length} quotes from carriers. Select the best option for your needs.
              </Typography>

              <Grid container spacing={3}>
                {quotes.map((quote, index) => (
                  <Grid item xs={12} md={6} lg={4} key={quote.id}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card
                        sx={{
                          height: '100%',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          border: selectedQuote?.id === quote.id ? '2px solid #667eea' : '1px solid #e0e0e0',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                          }
                        }}
                        onClick={() => handleSelectQuote(quote)}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="h4">
                                {getCarrierLogo(quote.carrier)}
                              </Typography>
                              <Box>
                                <Typography variant="h6" fontWeight="bold">
                                  {quote.carrier}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {quote.service}
                                </Typography>
                              </Box>
                            </Box>
                            <Box textAlign="right">
                              <Typography variant="h5" color="primary" fontWeight="bold">
                                ${quote.price.toFixed(2)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {quote.currency}
                              </Typography>
                            </Box>
                          </Box>

                          <Divider sx={{ my: 2 }} />

                          <Box mb={2}>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              {getServiceIcon(quote.service)}
                              <Typography variant="body2">
                                {formatTransitTime(quote.transitDays)}
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              Estimated delivery: {new Date(quote.deliveryDate).toLocaleDateString()}
                            </Typography>
                          </Box>

                          <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <Box display="flex" alignItems="center">
                              {[...Array(5)].map((_, i) => (
                                <StarIcon
                                  key={i}
                                  sx={{
                                    fontSize: 16,
                                    color: i < quote.reliability ? '#ffc107' : '#e0e0e0'
                                  }}
                                />
                              ))}
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              Reliability
                            </Typography>
                          </Box>

                          <Box mb={2}>
                            <Box display="flex" flexWrap="wrap" gap={0.5}>
                              {quote.features.map((feature, idx) => (
                                <Chip
                                  key={idx}
                                  label={feature}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              ))}
                            </Box>
                          </Box>

                          {quote.guaranteedDelivery && (
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <SecurityIcon color="success" sx={{ fontSize: 16 }} />
                              <Typography variant="caption" color="success.main">
                                Guaranteed Delivery
                              </Typography>
                            </Box>
                          )}

                          {quote.carbonNeutral && (
                            <Box display="flex" alignItems="center" gap={1}>
                              <EcoIcon color="success" sx={{ fontSize: 16 }} />
                              <Typography variant="caption" color="success.main">
                                Carbon Neutral
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>

              {selectedQuote && (
                <Box mt={4} textAlign="center">
                  <Alert severity="success" sx={{ mb: 3 }}>
                    Selected: {selectedQuote.carrier} {selectedQuote.service} - ${selectedQuote.price.toFixed(2)}
                  </Alert>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleProceedToCheckout}
                    startIcon={<PaymentIcon />}
                    sx={{
                      px: 6,
                      py: 2,
                      fontSize: '1.1rem',
                      background: 'linear-gradient(45deg, #4caf50 30%, #45a049 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #45a049 30%, #3d8b40 90%)',
                      }
                    }}
                  >
                    Proceed to Checkout
                  </Button>
                </Box>
              )}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  )
}
