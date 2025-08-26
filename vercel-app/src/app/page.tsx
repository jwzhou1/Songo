'use client'

import React from 'react'
import { Box, Container, Typography, Button, Grid, Card, CardContent, Chip } from '@mui/material'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useRouter } from 'next/navigation'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import TrackChangesIcon from '@mui/icons-material/TrackChanges'
import PaymentIcon from '@mui/icons-material/Payment'
import CloudIcon from '@mui/icons-material/Cloud'
import SecurityIcon from '@mui/icons-material/Security'
import InventoryIcon from '@mui/icons-material/Inventory'
import SpeedIcon from '@mui/icons-material/Speed'
import VerifiedIcon from '@mui/icons-material/Verified'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import CountUp from 'react-countup'
import HeroSection from '@/components/home/HeroSection'
import FeaturesSection from '@/components/home/FeaturesSection'
import StatsSection from '@/components/home/StatsSection'
import CarriersSection from '@/components/home/CarriersSection'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import CTASection from '@/components/home/CTASection'

const features = [
  {
    icon: <LocalShippingIcon sx={{ fontSize: 40 }} />,
    title: 'Multi-Carrier Integration',
    description: 'Real-time quotes from FedEx, UPS, DHL, USPS with live tracking and automated label generation.',
    color: '#667eea'
  },
  {
    icon: <TrackChangesIcon sx={{ fontSize: 40 }} />,
    title: 'GPS Tracking',
    description: 'Interactive Google Maps with real-time package location visualization and movement trajectory.',
    color: '#4caf50'
  },
  {
    icon: <PaymentIcon sx={{ fontSize: 40 }} />,
    title: 'Secure Payments',
    description: 'PCI DSS compliant payment processing with Stripe integration and saved payment methods.',
    color: '#ff9800'
  },
  {
    icon: <CloudIcon sx={{ fontSize: 40 }} />,
    title: 'AWS Cloud Architecture',
    description: 'Serverless Lambda functions, DynamoDB, S3, SNS, SQS, EventBridge for scalable operations.',
    color: '#2196f3'
  },
  {
    icon: <InventoryIcon sx={{ fontSize: 40 }} />,
    title: 'Pallet & Parcel Support',
    description: 'Dimensional weight calculation with freight and parcel routing optimization.',
    color: '#9c27b0'
  },
  {
    icon: <SecurityIcon sx={{ fontSize: 40 }} />,
    title: 'Enterprise Security',
    description: 'JWT authentication, role-based access, encryption, and comprehensive audit logging.',
    color: '#f44336'
  }
]

const stats = [
  { label: 'Shipments Processed', value: 50000, suffix: '+' },
  { label: 'Carrier Partners', value: 15, suffix: '+' },
  { label: 'Countries Served', value: 25, suffix: '+' },
  { label: 'Customer Satisfaction', value: 99, suffix: '%' }
]

const carriers = [
  { name: 'FedEx', logo: '/images/carriers/fedex.png', description: 'Express and ground shipping worldwide' },
  { name: 'UPS', logo: '/images/carriers/ups.png', description: 'Reliable package delivery and logistics' },
  { name: 'DHL', logo: '/images/carriers/dhl.png', description: 'International express delivery' },
  { name: 'USPS', logo: '/images/carriers/usps.png', description: 'US Postal Service integration' },
  { name: 'Canada Post', logo: '/images/carriers/canada-post.png', description: 'Canadian postal services' },
  { name: 'Purolator', logo: '/images/carriers/purolator.png', description: 'Canadian courier services' }
]

export default function HomePage() {
  const router = useRouter()
  const [heroRef, heroInView] = useInView({ threshold: 0.1, triggerOnce: true })
  const [featuresRef, featuresInView] = useInView({ threshold: 0.1, triggerOnce: true })
  const [statsRef, statsInView] = useInView({ threshold: 0.1, triggerOnce: true })

  const handleGetStarted = () => {
    router.push('/get-quote')
  }

  const handleTrackPackage = () => {
    router.push('/tracking')
  }

  return (
    <Box>
      {/* Hero Section */}
      <Box
        ref={heroRef}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography
                  variant="h2"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    lineHeight: 1.2
                  }}
                >
                  Enterprise Shipping
                  <br />
                  <span style={{ color: '#4caf50' }}>Made Simple</span>
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 4,
                    opacity: 0.9,
                    fontWeight: 300,
                    fontSize: { xs: '1.1rem', md: '1.3rem' }
                  }}
                >
                  Real-time multi-carrier quotes, GPS tracking, and secure payments.
                  Built with AWS cloud architecture for enterprise scalability.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleGetStarted}
                    sx={{
                      bgcolor: '#4caf50',
                      '&:hover': { bgcolor: '#45a049' },
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem'
                    }}
                    startIcon={<LocalShippingIcon />}
                  >
                    Get Quote
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={handleTrackPackage}
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)'
                      },
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem'
                    }}
                    startIcon={<TrackChangesIcon />}
                  >
                    Track Package
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={heroInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      textAlign: 'center',
                      '& img': {
                        maxWidth: '100%',
                        height: 'auto',
                        borderRadius: 2,
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                      }
                    }}
                  >
                    <img
                      src="/images/hero-dashboard.png"
                      alt="SonGo Enterprise Dashboard"
                      style={{ width: '100%', maxWidth: '500px' }}
                    />
                  </Box>
                </motion.div>
              </Grid>
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box ref={statsRef} sx={{ py: 8, bgcolor: '#f8f9fa' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={statsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Box textAlign="center">
                    <Typography
                      variant="h3"
                      component="div"
                      sx={{
                        fontWeight: 700,
                        color: '#667eea',
                        mb: 1
                      }}
                    >
                      {statsInView && (
                        <CountUp
                          end={stat.value}
                          duration={2}
                          suffix={stat.suffix}
                        />
                      )}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box ref={featuresRef} sx={{ py: 10 }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <Typography
              variant="h3"
              component="h2"
              textAlign="center"
              gutterBottom
              sx={{ fontWeight: 700, mb: 2 }}
            >
              Enterprise Features
            </Typography>
            <Typography
              variant="h6"
              textAlign="center"
              color="text.secondary"
              sx={{ mb: 6, maxWidth: '600px', mx: 'auto' }}
            >
              Comprehensive shipping management platform built with modern cloud technologies
            </Typography>
          </motion.div>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          mb: 2,
                          color: feature.color
                        }}
                      >
                        {feature.icon}
                        <Typography
                          variant="h6"
                          component="h3"
                          sx={{ ml: 2, fontWeight: 600 }}
                        >
                          {feature.title}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Carriers Section */}
      <Box sx={{ py: 8, bgcolor: '#f8f9fa' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            component="h2"
            textAlign="center"
            gutterBottom
            sx={{ fontWeight: 700, mb: 6 }}
          >
            Trusted Carrier Partners
          </Typography>
          <Grid container spacing={3}>
            {carriers.map((carrier, index) => (
              <Grid item xs={6} md={4} lg={2} key={index}>
                <Card
                  sx={{
                    textAlign: 'center',
                    p: 2,
                    height: '100%',
                    transition: 'transform 0.3s ease',
                    '&:hover': { transform: 'scale(1.05)' }
                  }}
                >
                  <Box
                    sx={{
                      height: 60,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {carrier.name}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {carrier.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 8,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
            Ready to Transform Your Shipping?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of businesses using SonGo Enterprise for their shipping needs
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleGetStarted}
              sx={{
                bgcolor: '#4caf50',
                '&:hover': { bgcolor: '#45a049' },
                px: 4,
                py: 1.5
              }}
            >
              Start Free Trial
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)'
                },
                px: 4,
                py: 1.5
              }}
            >
              Schedule Demo
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}
