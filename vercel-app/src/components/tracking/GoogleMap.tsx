'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Box, Paper, Typography, Chip, IconButton, Tooltip } from '@mui/material'
import { 
  MyLocation as MyLocationIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Fullscreen as FullscreenIcon,
  Layers as LayersIcon
} from '@mui/icons-material'
import { TrackingRoute } from '@/services/TrackingService'

interface GoogleMapProps {
  trackingRoute: TrackingRoute
  height?: number | string
  onLocationClick?: (location: any) => void
}

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

export const GoogleMap: React.FC<GoogleMapProps> = ({ 
  trackingRoute, 
  height = 500,
  onLocationClick 
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [directionsRenderer, setDirectionsRenderer] = useState<any>(null)
  const [markers, setMarkers] = useState<any[]>([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap')

  useEffect(() => {
    if (typeof window !== 'undefined' && window.google && mapRef.current) {
      initializeMap()
    } else {
      // Load Google Maps API if not already loaded
      loadGoogleMapsScript()
    }
  }, [])

  useEffect(() => {
    if (map && trackingRoute) {
      displayTrackingRoute()
    }
  }, [map, trackingRoute])

  const loadGoogleMapsScript = () => {
    if (typeof window !== 'undefined' && !window.google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=geometry,places&callback=initMap`
      script.async = true
      script.defer = true
      
      window.initMap = initializeMap
      
      script.onload = () => {
        if (mapRef.current) {
          initializeMap()
        }
      }
      
      document.head.appendChild(script)
    }
  }

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return

    const mapOptions = {
      zoom: 6,
      center: { lat: 39.8283, lng: -98.5795 }, // Center of USA
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: 'all',
          elementType: 'geometry.fill',
          stylers: [{ weight: '2.00' }]
        },
        {
          featureType: 'all',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#9c9c9c' }]
        },
        {
          featureType: 'all',
          elementType: 'labels.text',
          stylers: [{ visibility: 'on' }]
        },
        {
          featureType: 'landscape',
          elementType: 'all',
          stylers: [{ color: '#f2f2f2' }]
        },
        {
          featureType: 'water',
          elementType: 'all',
          stylers: [{ color: '#46bcec' }, { visibility: 'on' }]
        }
      ],
      disableDefaultUI: false,
      zoomControl: false,
      mapTypeControl: false,
      scaleControl: true,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false
    }

    const newMap = new window.google.maps.Map(mapRef.current, mapOptions)
    setMap(newMap)

    // Initialize directions renderer
    const renderer = new window.google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#667eea',
        strokeWeight: 4,
        strokeOpacity: 0.8
      }
    })
    renderer.setMap(newMap)
    setDirectionsRenderer(renderer)
  }

  const displayTrackingRoute = () => {
    if (!map || !trackingRoute) return

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null))
    setMarkers([])

    const newMarkers: any[] = []

    // Add origin marker
    const originMarker = new window.google.maps.Marker({
      position: trackingRoute.origin,
      map: map,
      title: 'Origin',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="12" fill="#4caf50" stroke="white" stroke-width="3"/>
            <text x="16" y="20" text-anchor="middle" fill="white" font-size="16" font-weight="bold">O</text>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(32, 32)
      },
      animation: window.google.maps.Animation.DROP
    })

    const originInfoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 8px; max-width: 200px;">
          <h4 style="margin: 0 0 8px 0; color: #4caf50;">📍 Origin</h4>
          <p style="margin: 0; font-size: 14px;">${trackingRoute.origin.address}</p>
        </div>
      `
    })

    originMarker.addListener('click', () => {
      originInfoWindow.open(map, originMarker)
    })

    newMarkers.push(originMarker)

    // Add destination marker
    const destinationMarker = new window.google.maps.Marker({
      position: trackingRoute.destination,
      map: map,
      title: 'Destination',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="12" fill="#f44336" stroke="white" stroke-width="3"/>
            <text x="16" y="20" text-anchor="middle" fill="white" font-size="16" font-weight="bold">D</text>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(32, 32)
      },
      animation: window.google.maps.Animation.DROP
    })

    const destinationInfoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 8px; max-width: 200px;">
          <h4 style="margin: 0 0 8px 0; color: #f44336;">🎯 Destination</h4>
          <p style="margin: 0; font-size: 14px;">${trackingRoute.destination.address}</p>
        </div>
      `
    })

    destinationMarker.addListener('click', () => {
      destinationInfoWindow.open(map, destinationMarker)
    })

    newMarkers.push(destinationMarker)

    // Add tracking location markers
    trackingRoute.locations.forEach((location, index) => {
      const isCurrentLocation = index === trackingRoute.locations.length - 1
      const markerColor = isCurrentLocation ? '#2196f3' : '#ff9800'
      const markerLabel = isCurrentLocation ? 'C' : (index + 1).toString()
      
      const marker = new window.google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: map,
        title: location.status,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="${markerColor}" stroke="white" stroke-width="3"/>
              <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${markerLabel}</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32)
        },
        animation: isCurrentLocation ? window.google.maps.Animation.BOUNCE : window.google.maps.Animation.DROP
      })

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 250px;">
            <h4 style="margin: 0 0 8px 0; color: ${markerColor};">
              ${isCurrentLocation ? '📍 Current Location' : '📦 Tracking Point'}
            </h4>
            <p style="margin: 0 0 4px 0; font-weight: bold;">${location.description}</p>
            <p style="margin: 0 0 4px 0; font-size: 14px;">${location.city}, ${location.state}</p>
            <p style="margin: 0; font-size: 12px; color: #666;">
              ${new Date(location.timestamp).toLocaleString()}
            </p>
            ${location.facilityName ? `<p style="margin: 4px 0 0 0; font-size: 12px; color: #666;">📍 ${location.facilityName}</p>` : ''}
          </div>
        `
      })

      marker.addListener('click', () => {
        // Close all other info windows
        newMarkers.forEach(m => {
          if (m.infoWindow) {
            m.infoWindow.close()
          }
        })
        infoWindow.open(map, marker)
        
        if (onLocationClick) {
          onLocationClick(location)
        }
      })

      marker.infoWindow = infoWindow
      newMarkers.push(marker)
    })

    setMarkers(newMarkers)

    // Draw tracking path
    if (trackingRoute.locations.length > 1) {
      const path = [
        trackingRoute.origin,
        ...trackingRoute.locations.map(loc => ({ lat: loc.lat, lng: loc.lng }))
      ]

      const trackingPath = new window.google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#ff6b35',
        strokeOpacity: 1.0,
        strokeWeight: 3,
        icons: [{
          icon: {
            path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 3,
            strokeColor: '#ff6b35'
          },
          offset: '100%',
          repeat: '100px'
        }]
      })

      trackingPath.setMap(map)
      
      // Animate the path
      animateTrackingPath(trackingPath)
    }

    // Fit map to show all markers
    fitMapToMarkers()
  }

  const animateTrackingPath = (polyline: any) => {
    let count = 0
    const icons = polyline.get('icons')
    
    const animate = () => {
      count = (count + 1) % 200
      
      if (icons[0]) {
        icons[0].offset = (count / 2) + '%'
        polyline.set('icons', icons)
      }
      
      setTimeout(animate, 100)
    }
    
    animate()
  }

  const fitMapToMarkers = () => {
    if (markers.length === 0 || !map) return

    const bounds = new window.google.maps.LatLngBounds()
    markers.forEach(marker => {
      bounds.extend(marker.getPosition())
    })

    map.fitBounds(bounds)
    
    // Ensure minimum zoom level
    window.google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
      if (map.getZoom() > 15) {
        map.setZoom(15)
      }
    })
  }

  const handleZoomIn = () => {
    if (map) {
      map.setZoom(map.getZoom() + 1)
    }
  }

  const handleZoomOut = () => {
    if (map) {
      map.setZoom(map.getZoom() - 1)
    }
  }

  const handleRecenter = () => {
    if (map && trackingRoute) {
      map.setCenter(trackingRoute.currentLocation)
      map.setZoom(12)
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const toggleMapType = () => {
    const types: ('roadmap' | 'satellite' | 'hybrid' | 'terrain')[] = ['roadmap', 'satellite', 'hybrid', 'terrain']
    const currentIndex = types.indexOf(mapType)
    const nextType = types[(currentIndex + 1) % types.length]
    setMapType(nextType)
    
    if (map) {
      map.setMapTypeId(window.google.maps.MapTypeId[nextType.toUpperCase()])
    }
  }

  return (
    <Box
      sx={{
        position: isFullscreen ? 'fixed' : 'relative',
        height: isFullscreen ? '100vh' : height,
        width: '100%',
        zIndex: isFullscreen ? 9999 : 'auto',
        top: isFullscreen ? 0 : 'auto',
        left: isFullscreen ? 0 : 'auto',
        bgcolor: '#f5f5f5',
        borderRadius: isFullscreen ? 0 : 2,
        overflow: 'hidden'
      }}
    >
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: isFullscreen ? 0 : '8px'
        }}
      />
      
      {/* Map Controls */}
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}
      >
        <Tooltip title="Zoom In">
          <IconButton
            onClick={handleZoomIn}
            sx={{
              bgcolor: 'white',
              boxShadow: 2,
              '&:hover': { bgcolor: '#f5f5f5' }
            }}
          >
            <ZoomInIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Zoom Out">
          <IconButton
            onClick={handleZoomOut}
            sx={{
              bgcolor: 'white',
              boxShadow: 2,
              '&:hover': { bgcolor: '#f5f5f5' }
            }}
          >
            <ZoomOutIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Center on Current Location">
          <IconButton
            onClick={handleRecenter}
            sx={{
              bgcolor: 'white',
              boxShadow: 2,
              '&:hover': { bgcolor: '#f5f5f5' }
            }}
          >
            <MyLocationIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Toggle Map Type">
          <IconButton
            onClick={toggleMapType}
            sx={{
              bgcolor: 'white',
              boxShadow: 2,
              '&:hover': { bgcolor: '#f5f5f5' }
            }}
          >
            <LayersIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
          <IconButton
            onClick={toggleFullscreen}
            sx={{
              bgcolor: 'white',
              boxShadow: 2,
              '&:hover': { bgcolor: '#f5f5f5' }
            }}
          >
            <FullscreenIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Map Legend */}
      <Paper
        sx={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          p: 2,
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          minWidth: 200
        }}
      >
        <Typography variant="subtitle2" gutterBottom fontWeight="bold">
          Map Legend
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: '#4caf50'
              }}
            />
            <Typography variant="caption">Origin</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: '#f44336'
              }}
            />
            <Typography variant="caption">Destination</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: '#2196f3'
              }}
            />
            <Typography variant="caption">Current Location</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: '#ff9800'
              }}
            />
            <Typography variant="caption">Tracking Points</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Current Map Type Indicator */}
      <Chip
        label={mapType.charAt(0).toUpperCase() + mapType.slice(1)}
        size="small"
        sx={{
          position: 'absolute',
          top: 10,
          left: 10,
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)'
        }}
      />
    </Box>
  )
}
