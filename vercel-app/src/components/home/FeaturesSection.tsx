'use client'

import React from 'react'
import { Box, Container, Typography, Grid, Card, CardContent } from '@mui/material'
import {
  LocalShipping as ShippingIcon,
  Timeline as TrackingIcon,
  Payment as PaymentIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material'
import { motion } from 'framer-motion'

const features = [
  {
    icon: <ShippingIcon sx={{ fontSize: 40 }} />,
    title: 'Multi-Carrier Integration',
    description: 'Connect with FedEx, UPS, DHL, USPS, and more. Get real-time rates and compare shipping options instantly.'
  },
  {
    icon: <TrackingIcon sx={{ fontSize: 40 }} />,
    title: 'Real-time GPS Tracking',
    description: 'Track packages with live GPS coordinates, interactive maps, and automated delivery notifications.'
  },
  {
    icon: <PaymentIcon sx={{ fontSize: 40 }} />,
    title: 'Secure Payment Processing',
    description: 'PCI DSS compliant payment handling with Stripe integration and saved payment methods.'
  },
  {
    icon: <SecurityIcon sx={{ fontSize: 40 }} />,
    title: 'Enterprise Security',
    description: 'Bank-level encryption, JWT authentication, and comprehensive audit logging for compliance.'
  },
  {
    icon: <SpeedIcon sx={{ fontSize: 40 }} />,
    title: 'Lightning Fast',
    description: 'Sub-200ms API responses, global CDN delivery, and optimized performance for scale.'
  },
  {
    icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
    title: 'Advanced Analytics',
    description: 'Comprehensive dashboards, cost optimization insights, and detailed shipping analytics.'
  }
]

export default function FeaturesSection() {
  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'grey.50' }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Typography
            variant="h2"
            component="h2"
            textAlign="center"
            sx={{
              mb: 2,
              fontWeight: 700,
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Enterprise Features
          </Typography>
          
          <Typography
            variant="h6"
            textAlign="center"
            color="text.secondary"
            sx={{ mb: 8, maxWidth: 600, mx: 'auto' }}
          >
            Built for scale with enterprise-grade features that grow with your business
          </Typography>
        </motion.div>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                        color: 'white',
                        mb: 3
                      }}
                    >
                      {feature.icon}
                    </Box>
                    
                    <Typography
                      variant="h5"
                      component="h3"
                      gutterBottom
                      fontWeight="bold"
                    >
                      {feature.title}
                    </Typography>
                    
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      lineHeight={1.6}
                    >
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
  )
}
