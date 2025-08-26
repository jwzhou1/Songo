'use client'

import React from 'react'
import { Box, Container, Typography, Grid, Card, CardContent, Avatar } from '@mui/material'
import { motion } from 'framer-motion'
import { Star as StarIcon } from '@mui/icons-material'

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Logistics Manager',
    company: 'TechCorp Inc.',
    avatar: '👩‍💼',
    rating: 5,
    text: 'SonGo Enterprise transformed our shipping operations. The real-time tracking and multi-carrier integration saved us 40% on shipping costs while improving delivery times.'
  },
  {
    name: 'Michael Chen',
    role: 'Operations Director',
    company: 'Global Retail Co.',
    avatar: '👨‍💼',
    rating: 5,
    text: 'The platform\'s reliability and enterprise features are outstanding. We process over 10,000 shipments monthly with zero downtime. Highly recommended!'
  },
  {
    name: 'Emily Rodriguez',
    role: 'Supply Chain Lead',
    company: 'Manufacturing Plus',
    avatar: '👩‍🔬',
    rating: 5,
    text: 'Integration was seamless and the analytics dashboard provides incredible insights. Our team can now make data-driven decisions about our shipping strategy.'
  }
]

export default function TestimonialsSection() {
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
            What Our Customers Say
          </Typography>
          
          <Typography
            variant="h6"
            textAlign="center"
            color="text.secondary"
            sx={{ mb: 8, maxWidth: 600, mx: 'auto' }}
          >
            Join thousands of satisfied customers who trust SonGo Enterprise for their shipping needs
          </Typography>
        </motion.div>

        <Grid container spacing={4}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    {/* Rating */}
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <StarIcon key={i} sx={{ color: '#FFD700', fontSize: 20 }} />
                      ))}
                    </Box>
                    
                    {/* Testimonial Text */}
                    <Typography
                      variant="body1"
                      sx={{
                        mb: 3,
                        fontStyle: 'italic',
                        lineHeight: 1.6,
                        position: 'relative',
                        '&::before': {
                          content: '"',
                          fontSize: '3rem',
                          color: 'primary.main',
                          position: 'absolute',
                          top: -10,
                          left: -10,
                          fontFamily: 'serif'
                        }
                      }}
                    >
                      {testimonial.text}
                    </Typography>
                    
                    {/* Author Info */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          width: 50,
                          height: 50,
                          fontSize: '1.5rem',
                          bgcolor: 'primary.main'
                        }}
                      >
                        {testimonial.avatar}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {testimonial.role}
                        </Typography>
                        <Typography variant="body2" color="primary.main" fontWeight="500">
                          {testimonial.company}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Trust Indicators */}
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
              Trusted by Industry Leaders
            </Typography>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 4,
                flexWrap: 'wrap',
                mt: 3
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  500+
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Enterprise Clients
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  4.9/5
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Customer Rating
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  99.9%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Uptime SLA
                </Typography>
              </Box>
            </Box>
          </Box>
        </motion.div>
      </Container>
    </Box>
  )
}
