'use client'

import React from 'react'
import { Box, Container, Typography, Button, Grid } from '@mui/material'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  RocketLaunch as RocketIcon,
  Timeline as TrackIcon,
  Support as SupportIcon
} from '@mui/icons-material'

export default function CTASection() {
  const router = useRouter()

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={8}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Typography
                variant="h2"
                component="h2"
                sx={{
                  mb: 3,
                  fontWeight: 700,
                  fontSize: { xs: '2rem', md: '3rem' }
                }}
              >
                Ready to Transform Your Shipping?
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
                Join thousands of businesses that have streamlined their logistics 
                with our enterprise-grade shipping platform.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <RocketIcon sx={{ fontSize: 24 }} />
                  <Typography variant="body1">
                    Quick 5-minute setup
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrackIcon sx={{ fontSize: 24 }} />
                  <Typography variant="body1">
                    Real-time tracking
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SupportIcon sx={{ fontSize: 24 }} />
                  <Typography variant="body1">
                    24/7 expert support
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
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
                  Start Free Trial
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => router.push('/demo')}
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
                  Watch Demo
                </Button>
              </Box>
            </motion.div>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Box
                sx={{
                  textAlign: 'center',
                  position: 'relative'
                }}
              >
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255,255,255,0.2)',
                    fontSize: '4rem',
                    mb: 3
                  }}
                >
                  🚀
                </Box>
                
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Launch in Minutes
                </Typography>
                
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Get started with our intuitive setup wizard and
                  start shipping smarter today.
                </Typography>
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
      
      {/* Floating elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: 20,
          height: 20,
          borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.2)',
          animation: 'float 6s ease-in-out infinite'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '60%',
          right: '15%',
          width: 15,
          height: 15,
          borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.3)',
          animation: 'float 4s ease-in-out infinite reverse'
        }}
      />
      
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </Box>
  )
}
