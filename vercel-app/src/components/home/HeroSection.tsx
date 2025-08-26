'use client'

import React from 'react'
import { Box, Container, Typography, Button, Grid } from '@mui/material'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function HeroSection() {
  const router = useRouter()

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        py: { xs: 8, md: 12 },
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Typography
                variant="h1"
                component="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  fontWeight: 700,
                  mb: 2,
                  lineHeight: 1.2
                }}
              >
                Enterprise Shipping
                <br />
                <span style={{ color: '#FFD700' }}>Made Simple</span>
              </Typography>
              
              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  opacity: 0.9,
                  fontWeight: 400,
                  lineHeight: 1.4
                }}
              >
                Real-time multi-carrier quotes, GPS tracking, and secure payments.
                Scale your logistics with enterprise-grade reliability.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => router.push('/get-quote')}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: 'grey.100',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Get Quote
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => router.push('/tracking')}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Track Package
                </Button>
              </Box>
            </motion.div>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Box
                sx={{
                  position: 'relative',
                  textAlign: 'center'
                }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: '8rem',
                    opacity: 0.1,
                    fontWeight: 900,
                    lineHeight: 1
                  }}
                >
                  🚚
                </Typography>
                
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 2,
                      p: 2,
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      Real-time Tracking
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      GPS-enabled package monitoring
                    </Typography>
                  </Box>
                  
                  <Box
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 2,
                      p: 2,
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      Multi-Carrier
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      FedEx, UPS, DHL, USPS integration
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
      
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '50%',
          height: '100%',
          opacity: 0.1,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="7" cy="7" r="7"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }}
      />
    </Box>
  )
}
