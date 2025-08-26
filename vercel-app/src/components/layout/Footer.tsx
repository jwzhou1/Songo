'use client'

import React from 'react'
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  useTheme
} from '@mui/material'
import {
  LocalShipping as ShippingIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon
} from '@mui/icons-material'

export default function Footer() {
  const theme = useTheme()
  const currentYear = new Date().getFullYear()

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'grey.900',
        color: 'white',
        py: 6,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ShippingIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              <Typography variant="h6" component="div" fontWeight="bold">
                SonGo Enterprise
              </Typography>
            </Box>
            <Typography variant="body2" color="grey.400" paragraph>
              Enterprise-grade shipping management platform with real-time tracking, 
              multi-carrier integration, and secure payment processing.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton 
                color="primary" 
                href="https://facebook.com/songo-enterprise" 
                target="_blank"
                size="small"
              >
                <FacebookIcon />
              </IconButton>
              <IconButton 
                color="primary" 
                href="https://twitter.com/SonGoEnterprise" 
                target="_blank"
                size="small"
              >
                <TwitterIcon />
              </IconButton>
              <IconButton 
                color="primary" 
                href="https://linkedin.com/company/songo-enterprise" 
                target="_blank"
                size="small"
              >
                <LinkedInIcon />
              </IconButton>
              <IconButton 
                color="primary" 
                href="https://github.com/songo-enterprise" 
                target="_blank"
                size="small"
              >
                <GitHubIcon />
              </IconButton>
            </Box>
          </Grid>

          {/* Services */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Services
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/get-quote" color="grey.400" underline="hover">
                Get Quote
              </Link>
              <Link href="/tracking" color="grey.400" underline="hover">
                Package Tracking
              </Link>
              <Link href="/dashboard" color="grey.400" underline="hover">
                Dashboard
              </Link>
              <Link href="/analytics" color="grey.400" underline="hover">
                Analytics
              </Link>
              <Link href="/api-docs" color="grey.400" underline="hover">
                API Documentation
              </Link>
            </Box>
          </Grid>

          {/* Carriers */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Carriers
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/carriers/fedex" color="grey.400" underline="hover">
                FedEx
              </Link>
              <Link href="/carriers/ups" color="grey.400" underline="hover">
                UPS
              </Link>
              <Link href="/carriers/dhl" color="grey.400" underline="hover">
                DHL
              </Link>
              <Link href="/carriers/usps" color="grey.400" underline="hover">
                USPS
              </Link>
              <Link href="/carriers/canada-post" color="grey.400" underline="hover">
                Canada Post
              </Link>
            </Box>
          </Grid>

          {/* Support */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Support
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/help" color="grey.400" underline="hover">
                Help Center
              </Link>
              <Link href="/contact" color="grey.400" underline="hover">
                Contact Us
              </Link>
              <Link href="/status" color="grey.400" underline="hover">
                System Status
              </Link>
              <Link href="/security" color="grey.400" underline="hover">
                Security
              </Link>
              <Link href="/compliance" color="grey.400" underline="hover">
                Compliance
              </Link>
            </Box>
          </Grid>

          {/* Contact */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Contact Info
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon sx={{ fontSize: 18, color: 'grey.400' }} />
                <Link href="mailto:support@songo-enterprise.com" color="grey.400" underline="hover">
                  support@songo-enterprise.com
                </Link>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon sx={{ fontSize: 18, color: 'grey.400' }} />
                <Link href="tel:+1-800-SONGO-HELP" color="grey.400" underline="hover">
                  +1-800-SONGO-HELP
                </Link>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <LocationIcon sx={{ fontSize: 18, color: 'grey.400', mt: 0.2 }} />
                <Typography variant="body2" color="grey.400">
                  123 Enterprise Way<br />
                  Tech City, TC 12345<br />
                  United States
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'grey.700' }} />

        {/* Bottom Section */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="grey.400">
              © {currentYear} SonGo Enterprise. All rights reserved.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              justifyContent: { xs: 'flex-start', md: 'flex-end' },
              flexWrap: 'wrap'
            }}>
              <Link href="/privacy" color="grey.400" underline="hover" variant="body2">
                Privacy Policy
              </Link>
              <Link href="/terms" color="grey.400" underline="hover" variant="body2">
                Terms of Service
              </Link>
              <Link href="/cookies" color="grey.400" underline="hover" variant="body2">
                Cookie Policy
              </Link>
              <Link href="/accessibility" color="grey.400" underline="hover" variant="body2">
                Accessibility
              </Link>
            </Box>
          </Grid>
        </Grid>

        {/* Additional Info */}
        <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'grey.700' }}>
          <Typography variant="caption" color="grey.500" display="block" textAlign="center">
            Built with Next.js, TypeScript, and Material-UI. Deployed on Vercel.
            <br />
            Enterprise-grade shipping platform designed for scale and reliability.
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}
