'use client'

import React from 'react'
import { Box, Container, Typography, Grid } from '@mui/material'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import { useInView } from 'react-intersection-observer'

const stats = [
  {
    number: 50000,
    suffix: '+',
    label: 'Shipments Processed',
    description: 'Successfully delivered packages worldwide'
  },
  {
    number: 99.9,
    suffix: '%',
    label: 'Uptime Guarantee',
    description: 'Enterprise-grade reliability and availability'
  },
  {
    number: 150,
    suffix: '+',
    label: 'Countries Served',
    description: 'Global shipping network coverage'
  },
  {
    number: 24,
    suffix: '/7',
    label: 'Support Available',
    description: 'Round-the-clock customer assistance'
  }
]

export default function StatsSection() {
  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true
  })

  return (
    <Box
      ref={ref}
      sx={{
        py: { xs: 8, md: 12 },
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
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
            sx={{ mb: 2, fontWeight: 700 }}
          >
            Trusted by Enterprises Worldwide
          </Typography>
          
          <Typography
            variant="h6"
            textAlign="center"
            sx={{ mb: 8, opacity: 0.9, maxWidth: 600, mx: 'auto' }}
          >
            Join thousands of companies that rely on our platform for their shipping needs
          </Typography>
        </motion.div>

        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Box
                  sx={{
                    textAlign: 'center',
                    p: 3,
                    borderRadius: 2,
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      background: 'rgba(255,255,255,0.15)'
                    }
                  }}
                >
                  <Typography
                    variant="h2"
                    component="div"
                    sx={{
                      fontWeight: 900,
                      mb: 1,
                      fontSize: { xs: '2.5rem', md: '3rem' },
                      lineHeight: 1
                    }}
                  >
                    {inView ? (
                      <CountUp
                        end={stat.number}
                        duration={2.5}
                        decimals={stat.number % 1 !== 0 ? 1 : 0}
                        suffix={stat.suffix}
                      />
                    ) : (
                      `0${stat.suffix}`
                    )}
                  </Typography>
                  
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{ mb: 1, fontWeight: 600 }}
                  >
                    {stat.label}
                  </Typography>
                  
                  <Typography
                    variant="body2"
                    sx={{ opacity: 0.8, lineHeight: 1.4 }}
                  >
                    {stat.description}
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
      
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.05,
          background: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }}
      />
    </Box>
  )
}
