'use client'

import React from 'react'
import { Box, Container, Typography, Grid, Card, CardContent } from '@mui/material'
import { motion } from 'framer-motion'

const carriers = [
  {
    name: 'FedEx',
    logo: '🚚',
    description: 'Express and ground shipping worldwide',
    features: ['Next Day Delivery', 'International Express', 'Ground Economy']
  },
  {
    name: 'UPS',
    logo: '📦',
    description: 'Reliable package delivery and logistics',
    features: ['UPS Ground', 'UPS Air', 'UPS Worldwide']
  },
  {
    name: 'DHL',
    logo: '✈️',
    description: 'Global express delivery and logistics',
    features: ['DHL Express', 'International', 'Same Day']
  },
  {
    name: 'USPS',
    logo: '📮',
    description: 'United States Postal Service',
    features: ['Priority Mail', 'Ground Advantage', 'Express Mail']
  },
  {
    name: 'Canada Post',
    logo: '🍁',
    description: 'Canadian postal and logistics services',
    features: ['Xpresspost', 'Regular Parcel', 'Priority']
  },
  {
    name: 'More Carriers',
    logo: '🌐',
    description: 'Expanding network of global partners',
    features: ['Regional Carriers', 'Specialty Services', 'Custom Integration']
  }
]

export default function CarriersSection() {
  return (
    <Box sx={{ py: { xs: 8, md: 12 } }}>
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
            Trusted Carrier Partners
          </Typography>
          
          <Typography
            variant="h6"
            textAlign="center"
            color="text.secondary"
            sx={{ mb: 8, maxWidth: 600, mx: 'auto' }}
          >
            Integrated with the world's leading shipping carriers for maximum flexibility and coverage
          </Typography>
        </motion.div>

        <Grid container spacing={3}>
          {carriers.map((carrier, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
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
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Typography
                      variant="h1"
                      sx={{
                        fontSize: '3rem',
                        mb: 2,
                        lineHeight: 1
                      }}
                    >
                      {carrier.logo}
                    </Typography>
                    
                    <Typography
                      variant="h5"
                      component="h3"
                      gutterBottom
                      fontWeight="bold"
                      color="primary"
                    >
                      {carrier.name}
                    </Typography>
                    
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ mb: 3, lineHeight: 1.5 }}
                    >
                      {carrier.description}
                    </Typography>
                    
                    <Box>
                      {carrier.features.map((feature, featureIndex) => (
                        <Box
                          key={featureIndex}
                          sx={{
                            display: 'inline-block',
                            bgcolor: 'grey.100',
                            borderRadius: 1,
                            px: 1.5,
                            py: 0.5,
                            m: 0.5,
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            color: 'text.secondary'
                          }}
                        >
                          {feature}
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
        >
          <Box
            sx={{
              mt: 8,
              p: 4,
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              border: '1px solid rgba(102, 126, 234, 0.2)',
              textAlign: 'center'
            }}
          >
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Need a Custom Integration?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              We can integrate with any carrier API to meet your specific shipping requirements.
              Contact our team to discuss custom carrier integrations.
            </Typography>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 2,
                flexWrap: 'wrap'
              }}
            >
              <Typography variant="body2" color="text.secondary">
                ✓ Custom API Integration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ✓ White-label Solutions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ✓ Enterprise Support
              </Typography>
            </Box>
          </Box>
        </motion.div>
      </Container>
    </Box>
  )
}
