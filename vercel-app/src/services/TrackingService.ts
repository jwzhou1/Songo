import axios from 'axios'
import { TrackingEvent, TrackingResponse } from './CarrierService'

export interface TrackingLocation {
  lat: number
  lng: number
  timestamp: string
  status: string
  description: string
  city: string
  state: string
  country: string
  address?: string
  facilityName?: string
}

export interface TrackingRoute {
  trackingNumber: string
  carrier: string
  currentLocation: TrackingLocation
  locations: TrackingLocation[]
  estimatedDelivery?: string
  actualDelivery?: string
  origin: { lat: number; lng: number; address: string }
  destination: { lat: number; lng: number; address: string }
  route?: { lat: number; lng: number }[]
  distance?: string
  duration?: string
}

export class TrackingService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || '/api'
  private googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  // Real-time tracking from multiple carriers
  async trackPackage(trackingNumber: string): Promise<TrackingResponse | null> {
    try {
      // Detect carrier from tracking number format
      const carrier = this.detectCarrier(trackingNumber)
      
      let trackingData: TrackingResponse | null = null
      
      switch (carrier) {
        case 'fedex':
          trackingData = await this.trackFedExPackage(trackingNumber)
          break
        case 'ups':
          trackingData = await this.trackUPSPackage(trackingNumber)
          break
        case 'dhl':
          trackingData = await this.trackDHLPackage(trackingNumber)
          break
        case 'usps':
          trackingData = await this.trackUSPSPackage(trackingNumber)
          break
        default:
          // Try all carriers if we can't detect
          trackingData = await this.trackFromAllCarriers(trackingNumber)
      }
      
      if (trackingData) {
        // Enhance with GPS coordinates
        trackingData = await this.enhanceWithGPSData(trackingData)
      }
      
      return trackingData
    } catch (error) {
      console.error('Error tracking package:', error)
      return null
    }
  }

  // FedEx tracking integration
  private async trackFedExPackage(trackingNumber: string): Promise<TrackingResponse | null> {
    try {
      const response = await axios.post(`${this.baseURL}/carriers/fedex/track`, {
        trackingInfo: [{
          trackingNumberInfo: {
            trackingNumber: trackingNumber
          }
        }],
        includeDetailedScans: true
      })

      const trackingData = response.data.output?.completeTrackResults?.[0]
      if (!trackingData) return null

      const events: TrackingEvent[] = []
      
      for (const scanEvent of trackingData.trackResults[0].scanEvents || []) {
        const coordinates = await this.getGoogleMapsCoordinates(
          `${scanEvent.scanLocation?.city}, ${scanEvent.scanLocation?.stateOrProvinceCode}`
        )
        
        events.push({
          timestamp: scanEvent.date,
          status: scanEvent.eventType,
          statusCode: scanEvent.eventType,
          statusDescription: scanEvent.eventDescription,
          location: {
            city: scanEvent.scanLocation?.city || '',
            state: scanEvent.scanLocation?.stateOrProvinceCode || '',
            country: scanEvent.scanLocation?.countryCode || '',
            coordinates,
            facilityName: scanEvent.scanLocation?.locationName,
            address: scanEvent.scanLocation?.streetLines?.join(', ')
          },
          carrier: 'FedEx',
          eventType: scanEvent.eventType,
          deliverySignature: scanEvent.deliverySignatureName
        })
      }

      return {
        trackingNumber,
        carrier: 'FedEx',
        currentStatus: trackingData.trackResults[0].latestStatusDetail?.statusByLocale || '',
        currentStatusCode: trackingData.trackResults[0].latestStatusDetail?.code || '',
        estimatedDelivery: trackingData.trackResults[0].estimatedDeliveryTimeWindow?.window?.ends,
        actualDelivery: trackingData.trackResults[0].actualDeliveryTimestamp,
        events: events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
        shipmentInfo: {
          origin: trackingData.trackResults[0].shipperInformation?.address?.city || '',
          destination: trackingData.trackResults[0].recipientInformation?.address?.city || '',
          service: trackingData.trackResults[0].serviceDetail || '',
          weight: trackingData.trackResults[0].packageDetails?.weightAndDimensions?.weight?.[0]?.value
        }
      }
    } catch (error) {
      console.error('FedEx tracking error:', error)
      return null
    }
  }

  // UPS tracking integration
  private async trackUPSPackage(trackingNumber: string): Promise<TrackingResponse | null> {
    try {
      const response = await axios.get(
        `${this.baseURL}/carriers/ups/track/${trackingNumber}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.UPS_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const trackingData = response.data.trackResponse?.shipment?.[0]
      if (!trackingData) return null

      const events: TrackingEvent[] = []
      
      for (const activity of trackingData.package[0].activity || []) {
        const coordinates = await this.getGoogleMapsCoordinates(
          `${activity.location?.address?.city}, ${activity.location?.address?.stateProvinceCode}`
        )
        
        events.push({
          timestamp: `${activity.date}T${activity.time}`,
          status: activity.status?.type,
          statusCode: activity.status?.code,
          statusDescription: activity.status?.description,
          location: {
            city: activity.location?.address?.city || '',
            state: activity.location?.address?.stateProvinceCode || '',
            country: activity.location?.address?.countryCode || '',
            coordinates,
            address: activity.location?.address?.addressLine1
          },
          carrier: 'UPS',
          eventType: activity.status?.type
        })
      }

      return {
        trackingNumber,
        carrier: 'UPS',
        currentStatus: trackingData.package[0].currentStatus?.description || '',
        currentStatusCode: trackingData.package[0].currentStatus?.code || '',
        estimatedDelivery: trackingData.package[0].deliveryDate?.[0]?.date,
        events: events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
        shipmentInfo: {
          origin: trackingData.shipper?.address?.city || '',
          destination: trackingData.shipTo?.address?.city || '',
          service: trackingData.service?.description || ''
        }
      }
    } catch (error) {
      console.error('UPS tracking error:', error)
      return null
    }
  }

  // DHL tracking integration
  private async trackDHLPackage(trackingNumber: string): Promise<TrackingResponse | null> {
    try {
      const response = await axios.get(
        `${this.baseURL}/carriers/dhl/track/${trackingNumber}`,
        {
          headers: {
            'DHL-API-Key': process.env.DHL_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      )

      const trackingData = response.data.shipments?.[0]
      if (!trackingData) return null

      const events: TrackingEvent[] = []
      
      for (const event of trackingData.events || []) {
        const coordinates = await this.getGoogleMapsCoordinates(
          `${event.location?.address?.addressLocality}`
        )
        
        events.push({
          timestamp: event.timestamp,
          status: event.statusCode,
          statusCode: event.statusCode,
          statusDescription: event.description,
          location: {
            city: event.location?.address?.addressLocality || '',
            state: event.location?.address?.addressRegion || '',
            country: event.location?.address?.countryCode || '',
            coordinates,
            facilityName: event.location?.address?.addressLocality
          },
          carrier: 'DHL',
          eventType: event.statusCode
        })
      }

      return {
        trackingNumber,
        carrier: 'DHL',
        currentStatus: trackingData.status?.description || '',
        currentStatusCode: trackingData.status?.statusCode || '',
        estimatedDelivery: trackingData.estimatedTimeOfDelivery,
        events: events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
        shipmentInfo: {
          origin: trackingData.origin?.address?.addressLocality || '',
          destination: trackingData.destination?.address?.addressLocality || '',
          service: trackingData.service || ''
        }
      }
    } catch (error) {
      console.error('DHL tracking error:', error)
      return null
    }
  }

  // USPS tracking integration
  private async trackUSPSPackage(trackingNumber: string): Promise<TrackingResponse | null> {
    try {
      const xmlRequest = `<TrackRequest USERID="${process.env.USPS_USER_ID}"><TrackID ID="${trackingNumber}"></TrackID></TrackRequest>`
      
      const response = await axios.get(
        `https://secure.shippingapis.com/ShippingAPI.dll?API=TrackV2&XML=${encodeURIComponent(xmlRequest)}`
      )

      // Parse XML response (simplified - would need proper XML parser in production)
      const events: TrackingEvent[] = [
        {
          timestamp: new Date().toISOString(),
          status: 'IN_TRANSIT',
          statusCode: 'IT',
          statusDescription: 'Package is in transit',
          location: {
            city: 'Processing Facility',
            state: 'Unknown',
            country: 'US'
          },
          carrier: 'USPS',
          eventType: 'IN_TRANSIT'
        }
      ]

      return {
        trackingNumber,
        carrier: 'USPS',
        currentStatus: 'In Transit',
        currentStatusCode: 'IT',
        events
      }
    } catch (error) {
      console.error('USPS tracking error:', error)
      return null
    }
  }

  // Try tracking from all carriers
  private async trackFromAllCarriers(trackingNumber: string): Promise<TrackingResponse | null> {
    const promises = [
      this.trackFedExPackage(trackingNumber),
      this.trackUPSPackage(trackingNumber),
      this.trackDHLPackage(trackingNumber),
      this.trackUSPSPackage(trackingNumber)
    ]

    const results = await Promise.allSettled(promises)
    
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        return result.value
      }
    }
    
    return null
  }

  // Enhance tracking data with GPS coordinates
  private async enhanceWithGPSData(trackingData: TrackingResponse): Promise<TrackingResponse> {
    const enhancedEvents = await Promise.all(
      trackingData.events.map(async (event) => {
        if (!event.location.coordinates) {
          const coordinates = await this.getGoogleMapsCoordinates(
            `${event.location.city}, ${event.location.state}, ${event.location.country}`
          )
          event.location.coordinates = coordinates
        }
        return event
      })
    )

    return {
      ...trackingData,
      events: enhancedEvents
    }
  }

  // Get GPS coordinates using Google Maps Geocoding API
  private async getGoogleMapsCoordinates(address: string): Promise<{lat: number, lng: number} | undefined> {
    if (!address || !this.googleMapsApiKey) return undefined

    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.googleMapsApiKey}`
      )
      
      if (response.data.results.length > 0) {
        const location = response.data.results[0].geometry.location
        return { lat: location.lat, lng: location.lng }
      }
      
      return undefined
    } catch (error) {
      console.error('Error getting coordinates:', error)
      return undefined
    }
  }

  // Create tracking route for map visualization
  async createTrackingRoute(trackingData: TrackingResponse): Promise<TrackingRoute | null> {
    if (!trackingData.events.length) return null

    const locations: TrackingLocation[] = trackingData.events
      .filter(event => event.location.coordinates)
      .map(event => ({
        lat: event.location.coordinates!.lat,
        lng: event.location.coordinates!.lng,
        timestamp: event.timestamp,
        status: event.status,
        description: event.statusDescription,
        city: event.location.city,
        state: event.location.state,
        country: event.location.country,
        address: event.location.address,
        facilityName: event.location.facilityName
      }))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    if (locations.length === 0) return null

    const currentLocation = locations[locations.length - 1]
    
    // Estimate origin and destination coordinates
    const origin = locations[0]
    const destination = await this.estimateDestination(trackingData)

    // Calculate route if Google Maps is available
    let route: { lat: number; lng: number }[] | undefined
    let distance: string | undefined
    let duration: string | undefined

    if (typeof window !== 'undefined' && (window as any).google) {
      const routeData = await this.calculateRoute(origin, destination)
      route = routeData?.route
      distance = routeData?.distance
      duration = routeData?.duration
    }

    return {
      trackingNumber: trackingData.trackingNumber,
      carrier: trackingData.carrier,
      currentLocation,
      locations,
      estimatedDelivery: trackingData.estimatedDelivery,
      actualDelivery: trackingData.actualDelivery,
      origin: {
        lat: origin.lat,
        lng: origin.lng,
        address: trackingData.shipmentInfo?.origin || `${origin.city}, ${origin.state}`
      },
      destination: {
        lat: destination.lat,
        lng: destination.lng,
        address: trackingData.shipmentInfo?.destination || `${destination.city}, ${destination.state}`
      },
      route,
      distance,
      duration
    }
  }

  // Calculate route using Google Maps Directions API
  private async calculateRoute(
    origin: TrackingLocation, 
    destination: TrackingLocation
  ): Promise<{route: { lat: number; lng: number }[], distance: string, duration: string} | null> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !(window as any).google?.maps?.DirectionsService) {
        resolve(null)
        return
      }

      const directionsService = new (window as any).google.maps.DirectionsService()
      
      directionsService.route({
        origin: new (window as any).google.maps.LatLng(origin.lat, origin.lng),
        destination: new (window as any).google.maps.LatLng(destination.lat, destination.lng),
        travelMode: (window as any).google.maps.TravelMode.DRIVING
      }, (result: any, status: any) => {
        if (status === (window as any).google.maps.DirectionsStatus.OK && result) {
          const route = result.routes[0]
          const path: { lat: number; lng: number }[] = []
          
          route.legs.forEach((leg: any) => {
            leg.steps.forEach((step: any) => {
              if (step.path) {
                step.path.forEach((point: any) => {
                  path.push({ lat: point.lat(), lng: point.lng() })
                })
              }
            })
          })
          
          resolve({
            route: path,
            distance: route.legs.reduce((total: number, leg: any) => total + (leg.distance?.value || 0), 0) + ' km',
            duration: route.legs.reduce((total: number, leg: any) => total + (leg.duration?.value || 0), 0) + ' mins'
          })
        } else {
          resolve(null)
        }
      })
    })
  }

  // Estimate destination coordinates
  private async estimateDestination(trackingData: TrackingResponse): Promise<TrackingLocation> {
    // If we have delivery event, use that location
    const deliveryEvent = trackingData.events.find(event => 
      event.status.toLowerCase().includes('delivered') || 
      event.status.toLowerCase().includes('delivery')
    )
    
    if (deliveryEvent?.location.coordinates) {
      return {
        lat: deliveryEvent.location.coordinates.lat,
        lng: deliveryEvent.location.coordinates.lng,
        timestamp: deliveryEvent.timestamp,
        status: deliveryEvent.status,
        description: deliveryEvent.statusDescription,
        city: deliveryEvent.location.city,
        state: deliveryEvent.location.state,
        country: deliveryEvent.location.country
      }
    }

    // Otherwise, use shipment destination info
    if (trackingData.shipmentInfo?.destination) {
      const coordinates = await this.getGoogleMapsCoordinates(trackingData.shipmentInfo.destination)
      if (coordinates) {
        return {
          lat: coordinates.lat,
          lng: coordinates.lng,
          timestamp: new Date().toISOString(),
          status: 'DESTINATION',
          description: 'Delivery destination',
          city: trackingData.shipmentInfo.destination.split(',')[0] || '',
          state: trackingData.shipmentInfo.destination.split(',')[1]?.trim() || '',
          country: 'US'
        }
      }
    }

    // Fallback to last known location
    const lastEvent = trackingData.events[0]
    return {
      lat: lastEvent.location.coordinates?.lat || 0,
      lng: lastEvent.location.coordinates?.lng || 0,
      timestamp: lastEvent.timestamp,
      status: lastEvent.status,
      description: lastEvent.statusDescription,
      city: lastEvent.location.city,
      state: lastEvent.location.state,
      country: lastEvent.location.country
    }
  }

  // Detect carrier from tracking number format
  private detectCarrier(trackingNumber: string): string {
    // FedEx patterns
    if (/^\d{12}$/.test(trackingNumber) || /^\d{14}$/.test(trackingNumber)) {
      return 'fedex'
    }
    
    // UPS patterns
    if (/^1Z[0-9A-Z]{16}$/.test(trackingNumber)) {
      return 'ups'
    }
    
    // DHL patterns
    if (/^\d{10}$/.test(trackingNumber) || /^\d{11}$/.test(trackingNumber)) {
      return 'dhl'
    }
    
    // USPS patterns
    if (/^(94|93|92|94|95)\d{20}$/.test(trackingNumber) || 
        /^[A-Z]{2}\d{9}[A-Z]{2}$/.test(trackingNumber)) {
      return 'usps'
    }
    
    return 'unknown'
  }

  // Real-time tracking simulation for demo
  simulateRealTimeTracking(trackingNumber: string): Promise<TrackingResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockTrackingData: TrackingResponse = {
          trackingNumber,
          carrier: 'Demo Carrier',
          currentStatus: 'In Transit',
          currentStatusCode: 'IT',
          estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          events: [
            {
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'PICKED_UP',
              statusCode: 'PU',
              statusDescription: 'Package picked up',
              location: {
                city: 'New York',
                state: 'NY',
                country: 'US',
                coordinates: { lat: 40.7128, lng: -74.0060 }
              },
              carrier: 'Demo Carrier',
              eventType: 'PICKUP'
            },
            {
              timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'IN_TRANSIT',
              statusCode: 'IT',
              statusDescription: 'In transit to sorting facility',
              location: {
                city: 'Chicago',
                state: 'IL',
                country: 'US',
                coordinates: { lat: 41.8781, lng: -87.6298 }
              },
              carrier: 'Demo Carrier',
              eventType: 'IN_TRANSIT'
            },
            {
              timestamp: new Date().toISOString(),
              status: 'OUT_FOR_DELIVERY',
              statusCode: 'OFD',
              statusDescription: 'Out for delivery',
              location: {
                city: 'Los Angeles',
                state: 'CA',
                country: 'US',
                coordinates: { lat: 34.0522, lng: -118.2437 }
              },
              carrier: 'Demo Carrier',
              eventType: 'OUT_FOR_DELIVERY'
            }
          ],
          shipmentInfo: {
            origin: 'New York, NY',
            destination: 'Los Angeles, CA',
            service: 'Ground',
            weight: '5 lbs'
          }
        }
        
        resolve(mockTrackingData)
      }, 1000)
    })
  }
}
