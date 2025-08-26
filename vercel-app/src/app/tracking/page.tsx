'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material'
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot
} from '@mui/lab'
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  Map as MapIcon,
  Timeline as TimelineIcon,
  Info as InfoIcon,
  Notifications as NotificationsIcon,
  Share as ShareIcon
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { TrackingService, TrackingRoute } from '@/services/TrackingService'
import { GoogleMap } from '@/components/tracking/GoogleMap'
import toast from 'react-hot-toast'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tracking-tabpanel-${index}`}
      aria-labelledby={`tracking-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

export default function TrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [trackingData, setTrackingData] = useState<any>(null)
  const [trackingRoute, setTrackingRoute] = useState<TrackingRoute | null>(null)
  const [loading, setLoading] = useState(false)
  const [tabValue, setTabValue] = useState(0)
  const [realTimeUpdates, setRealTimeUpdates] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const trackingService = new TrackingService()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (realTimeUpdates && trackingNumber) {
      intervalRef.current = setInterval(() => {
        handleTrackPackage(false)
      }, 30000) // Update every 30 seconds
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [realTimeUpdates, trackingNumber])

  const handleTrackPackage = async (showLoading = true) => {
    if (!trackingNumber.trim()) {
      toast.error('Please enter a tracking number')
      return
    }

    if (showLoading) setLoading(true)

    try {
      // Try real tracking first, fallback to simulation
      let data = await trackingService.trackPackage(trackingNumber)
      
      if (!data) {
        // Use simulation for demo
        data = await trackingService.simulateRealTimeTracking(trackingNumber)
      }

      if (data) {
        setTrackingData(data)
        setLastUpdated(new Date())
        
        // Create tracking route for map
        const route = await trackingService.createTrackingRoute(data)
        setTrackingRoute(route)
        
        if (showLoading) {
          toast.success('Tracking information updated!')
        }
      } else {
        toast.error('No tracking information found')
      }
    } catch (error) {
      console.error('Tracking error:', error)
      toast.error('Failed to track package. Please try again.')
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'PICKED_UP': '#ff9800',
      'IN_TRANSIT': '#2196f3',
      'OUT_FOR_DELIVERY': '#9c27b0',
      'DELIVERED': '#4caf50',
      'EXCEPTION': '#f44336',
      'PENDING': '#757575'
    }
    return statusColors[status] || '#757575'
  }

  const getStatusIcon = (status: string) => {
    const statusIcons: { [key: string]: React.ReactNode } = {
      'PICKED_UP': <ShippingIcon />,
      'IN_TRANSIT': <LocationIcon />,
      'OUT_FOR_DELIVERY': <ShippingIcon />,
      'DELIVERED': <CheckCircleIcon />,
      'EXCEPTION': <InfoIcon />,
      'PENDING': <ScheduleIcon />
    }
    return statusIcons[status] || <InfoIcon />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleShare = () => {
    if (navigator.share && trackingNumber) {
      navigator.share({
        title: 'Package Tracking',
        text: `Track package ${trackingNumber}`,
        url: `${window.location.origin}/tracking?number=${trackingNumber}`
      })
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/tracking?number=${trackingNumber}`)
      toast.success('Tracking link copied to clipboard!')
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom textAlign="center" sx={{ mb: 2 }}>
        📦 Track Your Package
      </Typography>
      <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
        Real-time GPS tracking with interactive maps and detailed delivery updates
      </Typography>

      {/* Search Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            fullWidth
            label="Enter Tracking Number"
            placeholder="e.g., 1Z999AA1234567890, 123456789012"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleTrackPackage()}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
          <Button
            variant="contained"
            onClick={() => handleTrackPackage()}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
            sx={{
              px: 4,
              py: 1.5,
              minWidth: 120,
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
              }
            }}
          >
            {loading ? 'Tracking...' : 'Track'}
          </Button>
        </Box>
      </Paper>

      {/* Tracking Results */}
      <AnimatePresence>
        {trackingData && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
          >
            {/* Status Overview */}
            <Card sx={{ mb: 4 }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Box>
                    <Typography variant="h5" gutterBottom>
                      {trackingData.carrier} - {trackingData.trackingNumber}
                    </Typography>
                    <Chip
                      label={trackingData.currentStatus}
                      color={trackingData.currentStatus === 'DELIVERED' ? 'success' : 'primary'}
                      sx={{ fontSize: '0.9rem', px: 1 }}
                    />
                  </Box>
                  <Box display="flex" gap={1}>
                    <Tooltip title="Refresh tracking">
                      <IconButton onClick={() => handleTrackPackage()}>
                        <RefreshIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Share tracking">
                      <IconButton onClick={handleShare}>
                        <ShareIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Box textAlign="center">
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Estimated Delivery
                      </Typography>
                      <Typography variant="h6">
                        {trackingData.estimatedDelivery 
                          ? new Date(trackingData.estimatedDelivery).toLocaleDateString()
                          : 'Calculating...'
                        }
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box textAlign="center">
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Service Type
                      </Typography>
                      <Typography variant="h6">
                        {trackingData.shipmentInfo?.service || 'Standard'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box textAlign="center">
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Weight
                      </Typography>
                      <Typography variant="h6">
                        {trackingData.shipmentInfo?.weight || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Box mt={3} display="flex" justifyContent="space-between" alignItems="center">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={realTimeUpdates}
                        onChange={(e) => setRealTimeUpdates(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Real-time Updates"
                  />
                  {lastUpdated && (
                    <Typography variant="caption" color="text.secondary">
                      Last updated: {lastUpdated.toLocaleTimeString()}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Tabs for Map and Timeline */}
            <Paper elevation={2}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  '& .MuiTab-root': {
                    minHeight: 60,
                    fontSize: '1rem'
                  }
                }}
              >
                <Tab
                  icon={<MapIcon />}
                  label="Live Map"
                  iconPosition="start"
                />
                <Tab
                  icon={<TimelineIcon />}
                  label="Tracking History"
                  iconPosition="start"
                />
                <Tab
                  icon={<InfoIcon />}
                  label="Shipment Details"
                  iconPosition="start"
                />
              </Tabs>

              {/* Map Tab */}
              <TabPanel value={tabValue} index={0}>
                <Box sx={{ height: 500, position: 'relative' }}>
                  {trackingRoute ? (
                    <GoogleMap trackingRoute={trackingRoute} />
                  ) : (
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      height="100%"
                      bgcolor="#f5f5f5"
                      borderRadius={2}
                    >
                      <Box textAlign="center">
                        <MapIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                          Map Loading...
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          GPS coordinates are being processed
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
                
                {trackingRoute && (
                  <Box mt={3}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                          <LocationIcon color="success" sx={{ mb: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            Origin
                          </Typography>
                          <Typography variant="body1" fontWeight="bold">
                            {trackingRoute.origin.address}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                          <LocationIcon color="primary" sx={{ mb: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            Current Location
                          </Typography>
                          <Typography variant="body1" fontWeight="bold">
                            {trackingRoute.currentLocation.city}, {trackingRoute.currentLocation.state}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                          <LocationIcon color="error" sx={{ mb: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            Destination
                          </Typography>
                          <Typography variant="body1" fontWeight="bold">
                            {trackingRoute.destination.address}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </TabPanel>

              {/* Timeline Tab */}
              <TabPanel value={tabValue} index={1}>
                <Timeline>
                  {trackingData.events.map((event: any, index: number) => (
                    <TimelineItem key={index}>
                      <TimelineSeparator>
                        <TimelineDot
                          sx={{
                            bgcolor: getStatusColor(event.status),
                            color: 'white'
                          }}
                        >
                          {getStatusIcon(event.status)}
                        </TimelineDot>
                        {index < trackingData.events.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                          <Typography variant="h6" gutterBottom>
                            {event.statusDescription}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {formatDate(event.timestamp)}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1} mt={1}>
                            <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {event.location.city}, {event.location.state} {event.location.country}
                            </Typography>
                          </Box>
                          {event.location.coordinates && (
                            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                              GPS: {event.location.coordinates.lat.toFixed(4)}, {event.location.coordinates.lng.toFixed(4)}
                            </Typography>
                          )}
                          {event.deliverySignature && (
                            <Alert severity="success" sx={{ mt: 2 }}>
                              Signed by: {event.deliverySignature}
                            </Alert>
                          )}
                        </Paper>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </TabPanel>

              {/* Details Tab */}
              <TabPanel value={tabValue} index={2}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        📋 Shipment Information
                      </Typography>
                      <Box sx={{ '& > div': { mb: 2 } }}>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Tracking Number:
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {trackingData.trackingNumber}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Carrier:
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {trackingData.carrier}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Service:
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {trackingData.shipmentInfo?.service || 'Standard'}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Weight:
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {trackingData.shipmentInfo?.weight || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        🚚 Delivery Information
                      </Typography>
                      <Box sx={{ '& > div': { mb: 2 } }}>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Origin:
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {trackingData.shipmentInfo?.origin || 'N/A'}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Destination:
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {trackingData.shipmentInfo?.destination || 'N/A'}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Estimated Delivery:
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {trackingData.estimatedDelivery 
                              ? new Date(trackingData.estimatedDelivery).toLocaleDateString()
                              : 'Calculating...'
                            }
                          </Typography>
                        </Box>
                        {trackingData.actualDelivery && (
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">
                              Actual Delivery:
                            </Typography>
                            <Typography variant="body2" fontWeight="bold" color="success.main">
                              {new Date(trackingData.actualDelivery).toLocaleDateString()}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>

                {trackingData.deliveryProof && (
                  <Paper sx={{ p: 3, mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      📸 Delivery Proof
                    </Typography>
                    <Grid container spacing={2}>
                      {trackingData.deliveryProof.signature && (
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Signature:
                          </Typography>
                          <Typography variant="body1" fontWeight="bold">
                            {trackingData.deliveryProof.signedBy}
                          </Typography>
                        </Grid>
                      )}
                      {trackingData.deliveryProof.deliveredTo && (
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Delivered To:
                          </Typography>
                          <Typography variant="body1" fontWeight="bold">
                            {trackingData.deliveryProof.deliveredTo}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Paper>
                )}
              </TabPanel>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Demo Instructions */}
      {!trackingData && (
        <Paper sx={{ p: 3, mt: 4, bgcolor: '#f8f9fa' }}>
          <Typography variant="h6" gutterBottom>
            🎯 Try Demo Tracking Numbers
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Use these sample tracking numbers to see the platform in action:
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {['1Z999AA1234567890', '123456789012', '9400111899562509455013', 'DHL123456789'].map((number) => (
              <Chip
                key={number}
                label={number}
                onClick={() => setTrackingNumber(number)}
                clickable
                variant="outlined"
                sx={{ fontFamily: 'monospace' }}
              />
            ))}
          </Box>
        </Paper>
      )}
    </Container>
  )
}
