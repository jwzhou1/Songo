/**
 * Interactive Tracking Map Component
 * Shows real-time package/pallet movement with route visualization
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  GoogleMap,
  LoadScript,
  Marker,
  Polyline,
  InfoWindow,
  DirectionsService,
  DirectionsRenderer,
} from '@react-google-maps/api';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Alert,
} from '@mui/material';
import {
  MyLocation,
  Refresh,
  Fullscreen,
  FullscreenExit,
  Timeline,
  LocalShipping,
  Flag,
  LocationOn,
} from '@mui/icons-material';

// Types
interface TrackingLocation {
  lat: number;
  lng: number;
  address?: string;
  timestamp?: string;
  status?: string;
  description?: string;
}

interface TrackingMapProps {
  trackingNumber: string;
  currentLocation?: TrackingLocation;
  origin?: TrackingLocation;
  destination?: TrackingLocation;
  routePoints?: TrackingLocation[];
  estimatedRoute?: TrackingLocation[];
  onLocationUpdate?: (location: TrackingLocation) => void;
  height?: string | number;
  showTraffic?: boolean;
  showRoute?: boolean;
  autoCenter?: boolean;
}

const mapContainerStyle = {
  width: '100%',
  height: '500px',
};

const defaultCenter = {
  lat: 39.8283, // Center of USA
  lng: -98.5795,
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: true,
  fullscreenControl: false,
};

const TrackingMap: React.FC<TrackingMapProps> = ({
  trackingNumber,
  currentLocation,
  origin,
  destination,
  routePoints = [],
  estimatedRoute = [],
  onLocationUpdate,
  height = '500px',
  showTraffic = false,
  showRoute = true,
  autoCenter = true,
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<TrackingLocation | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTrafficLayer, setShowTrafficLayer] = useState(showTraffic);
  const [showEstimatedRoute, setShowEstimatedRoute] = useState(showRoute);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Map bounds calculation
  const calculateBounds = useCallback(() => {
    if (!map) return;

    const bounds = new google.maps.LatLngBounds();
    
    if (origin) bounds.extend(origin);
    if (destination) bounds.extend(destination);
    if (currentLocation) bounds.extend(currentLocation);
    
    routePoints.forEach(point => bounds.extend(point));
    
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds);
    }
  }, [map, origin, destination, currentLocation, routePoints]);

  // Initialize map
  const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  // Auto-center map when locations change
  useEffect(() => {
    if (autoCenter && map) {
      calculateBounds();
    }
  }, [autoCenter, map, calculateBounds]);

  // Traffic layer toggle
  useEffect(() => {
    if (map) {
      const trafficLayer = new google.maps.TrafficLayer();
      if (showTrafficLayer) {
        trafficLayer.setMap(map);
      } else {
        trafficLayer.setMap(null);
      }
    }
  }, [map, showTrafficLayer]);

  // Get directions for estimated route
  const getDirections = useCallback(() => {
    if (!origin || !destination || !showEstimatedRoute) return;

    setIsLoading(true);
    setError(null);

    const directionsService = new google.maps.DirectionsService();
    
    directionsService.route(
      {
        origin: origin,
        destination: destination,
        waypoints: routePoints.map(point => ({ location: point, stopover: true })),
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true,
      },
      (result, status) => {
        setIsLoading(false);
        if (status === 'OK' && result) {
          setDirections(result);
        } else {
          setError('Failed to calculate route');
        }
      }
    );
  }, [origin, destination, routePoints, showEstimatedRoute]);

  useEffect(() => {
    getDirections();
  }, [getDirections]);

  // Marker icons
  const getMarkerIcon = (type: 'origin' | 'destination' | 'current' | 'waypoint') => {
    const baseUrl = 'https://maps.google.com/mapfiles/ms/icons/';
    switch (type) {
      case 'origin':
        return `${baseUrl}green-dot.png`;
      case 'destination':
        return `${baseUrl}red-dot.png`;
      case 'current':
        return `${baseUrl}blue-dot.png`;
      case 'waypoint':
        return `${baseUrl}yellow-dot.png`;
      default:
        return `${baseUrl}blue-dot.png`;
    }
  };

  // Refresh tracking data
  const handleRefresh = () => {
    if (onLocationUpdate && currentLocation) {
      onLocationUpdate(currentLocation);
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Center map on current location
  const centerOnCurrent = () => {
    if (map && currentLocation) {
      map.panTo(currentLocation);
      map.setZoom(15);
    }
  };

  const mapStyle = {
    width: '100%',
    height: isFullscreen ? '100vh' : height,
    position: isFullscreen ? 'fixed' as const : 'relative' as const,
    top: isFullscreen ? 0 : 'auto',
    left: isFullscreen ? 0 : 'auto',
    zIndex: isFullscreen ? 9999 : 'auto',
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent sx={{ p: 2 }}>
        {/* Map Controls */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h3">
            Live Tracking Map
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showTrafficLayer}
                  onChange={(e) => setShowTrafficLayer(e.target.checked)}
                  size="small"
                />
              }
              label="Traffic"
              sx={{ mr: 1 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={showEstimatedRoute}
                  onChange={(e) => setShowEstimatedRoute(e.target.checked)}
                  size="small"
                />
              }
              label="Route"
              sx={{ mr: 1 }}
            />

            <Tooltip title="Center on current location">
              <IconButton onClick={centerOnCurrent} size="small">
                <MyLocation />
              </IconButton>
            </Tooltip>

            <Tooltip title="Refresh tracking">
              <IconButton onClick={handleRefresh} size="small">
                <Refresh />
              </IconButton>
            </Tooltip>

            <Tooltip title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
              <IconButton onClick={toggleFullscreen} size="small">
                {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Map */}
        <Box sx={mapStyle}>
          <LoadScript
            googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''}
            libraries={['geometry', 'drawing']}
          >
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={currentLocation || defaultCenter}
              zoom={currentLocation ? 12 : 4}
              options={mapOptions}
              onLoad={onMapLoad}
            >
              {/* Origin Marker */}
              {origin && (
                <Marker
                  position={origin}
                  icon={getMarkerIcon('origin')}
                  title="Origin"
                  onClick={() => setSelectedMarker(origin)}
                />
              )}

              {/* Destination Marker */}
              {destination && (
                <Marker
                  position={destination}
                  icon={getMarkerIcon('destination')}
                  title="Destination"
                  onClick={() => setSelectedMarker(destination)}
                />
              )}

              {/* Current Location Marker */}
              {currentLocation && (
                <Marker
                  position={currentLocation}
                  icon={getMarkerIcon('current')}
                  title="Current Location"
                  onClick={() => setSelectedMarker(currentLocation)}
                  animation={google.maps.Animation.BOUNCE}
                />
              )}

              {/* Route Points */}
              {routePoints.map((point, index) => (
                <Marker
                  key={index}
                  position={point}
                  icon={getMarkerIcon('waypoint')}
                  title={`Stop ${index + 1}`}
                  onClick={() => setSelectedMarker(point)}
                />
              ))}

              {/* Actual Route Polyline */}
              {routePoints.length > 1 && (
                <Polyline
                  path={routePoints}
                  options={{
                    strokeColor: '#2196F3',
                    strokeOpacity: 1,
                    strokeWeight: 4,
                  }}
                />
              )}

              {/* Estimated Route */}
              {directions && showEstimatedRoute && (
                <DirectionsRenderer
                  directions={directions}
                  options={{
                    suppressMarkers: true,
                    polylineOptions: {
                      strokeColor: '#4CAF50',
                      strokeOpacity: 0.7,
                      strokeWeight: 3,
                    },
                  }}
                />
              )}

              {/* Info Window */}
              {selectedMarker && (
                <InfoWindow
                  position={selectedMarker}
                  onCloseClick={() => setSelectedMarker(null)}
                >
                  <Box sx={{ p: 1, minWidth: 200 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {selectedMarker.status || 'Location'}
                    </Typography>
                    {selectedMarker.description && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {selectedMarker.description}
                      </Typography>
                    )}
                    {selectedMarker.address && (
                      <Typography variant="body2" gutterBottom>
                        {selectedMarker.address}
                      </Typography>
                    )}
                    {selectedMarker.timestamp && (
                      <Typography variant="caption" color="text.secondary">
                        {new Date(selectedMarker.timestamp).toLocaleString()}
                      </Typography>
                    )}
                  </Box>
                </InfoWindow>
              )}
            </GoogleMap>
          </LoadScript>
        </Box>

        {/* Map Legend */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2, flexWrap: 'wrap' }}>
          <Chip
            icon={<LocationOn />}
            label="Origin"
            size="small"
            sx={{ backgroundColor: '#4CAF50', color: 'white' }}
          />
          <Chip
            icon={<Flag />}
            label="Destination"
            size="small"
            sx={{ backgroundColor: '#F44336', color: 'white' }}
          />
          <Chip
            icon={<LocalShipping />}
            label="Current Location"
            size="small"
            sx={{ backgroundColor: '#2196F3', color: 'white' }}
          />
          <Chip
            icon={<Timeline />}
            label="Route Points"
            size="small"
            sx={{ backgroundColor: '#FF9800', color: 'white' }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default TrackingMap;
