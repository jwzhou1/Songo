import axios from 'axios'

export interface Address {
  name?: string
  company?: string
  address: string
  city: string
  state: string
  zip: string
  country: string
  phone?: string
  email?: string
}

export interface Package {
  type: 'PALLET' | 'PARCEL' | 'ENVELOPE' | 'BOX'
  dimensions: {
    length: number
    width: number
    height: number
    weight: number
    unit: 'IN' | 'CM'
    weightUnit: 'LB' | 'KG'
  }
  value: number
  contents: string
  hazardous?: boolean
  fragile?: boolean
  signature?: boolean
  insurance?: boolean
}

export interface ShipmentRequest {
  origin: Address
  destination: Address
  packages: Package[]
  serviceLevel: 'GROUND' | 'EXPRESS' | 'OVERNIGHT' | 'ECONOMY' | 'INTERNATIONAL'
  pickupDate: string
  deliveryDate?: string
  specialInstructions?: string
  insurance?: boolean
  signatureRequired?: boolean
  saturdayDelivery?: boolean
  residentialDelivery?: boolean
}

export interface CarrierQuote {
  id: string
  carrier: string
  service: string
  serviceCode: string
  price: number
  currency: string
  transitDays: number
  deliveryDate: string
  features: string[]
  restrictions?: string[]
  trackingIncluded: boolean
  insuranceIncluded: boolean
  signatureRequired: boolean
  carbonNeutral?: boolean
  reliability: number // 1-5 stars
  estimatedDeliveryTime?: string
  guaranteedDelivery?: boolean
  fuelSurcharge?: number
  accessorialCharges?: { [key: string]: number }
}

export interface TrackingEvent {
  timestamp: string
  status: string
  statusCode: string
  statusDescription: string
  location: {
    city: string
    state: string
    country: string
    coordinates?: {
      lat: number
      lng: number
    }
    facilityName?: string
    address?: string
  }
  carrier: string
  eventType: string
  deliverySignature?: string
  estimatedDelivery?: string
  nextLocation?: string
  delay?: {
    reason: string
    expectedResolution: string
  }
}

export interface TrackingResponse {
  trackingNumber: string
  carrier: string
  currentStatus: string
  currentStatusCode: string
  estimatedDelivery?: string
  actualDelivery?: string
  events: TrackingEvent[]
  shipmentInfo?: {
    origin: string
    destination: string
    service: string
    weight?: string
    dimensions?: string
    value?: number
  }
  deliveryProof?: {
    signature?: string
    photo?: string
    signedBy?: string
    deliveredTo?: string
  }
}

export class CarrierService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || '/api'

  // FedEx Integration
  async getFedExQuotes(request: ShipmentRequest): Promise<CarrierQuote[]> {
    try {
      const response = await axios.post(`${this.baseURL}/carriers/fedex/quotes`, {
        accountNumber: process.env.FEDEX_ACCOUNT_NUMBER,
        meterNumber: process.env.FEDEX_METER_NUMBER,
        requestedShipment: {
          shipper: {
            contact: {
              personName: request.origin.name,
              companyName: request.origin.company,
              phoneNumber: request.origin.phone
            },
            address: {
              streetLines: [request.origin.address],
              city: request.origin.city,
              stateOrProvinceCode: request.origin.state,
              postalCode: request.origin.zip,
              countryCode: request.origin.country
            }
          },
          recipient: {
            contact: {
              personName: request.destination.name,
              companyName: request.destination.company,
              phoneNumber: request.destination.phone
            },
            address: {
              streetLines: [request.destination.address],
              city: request.destination.city,
              stateOrProvinceCode: request.destination.state,
              postalCode: request.destination.zip,
              countryCode: request.destination.country
            }
          },
          requestedPackageLineItems: request.packages.map(pkg => ({
            weight: {
              units: pkg.dimensions.weightUnit === 'LB' ? 'LB' : 'KG',
              value: pkg.dimensions.weight
            },
            dimensions: {
              length: pkg.dimensions.length,
              width: pkg.dimensions.width,
              height: pkg.dimensions.height,
              units: pkg.dimensions.unit
            },
            declaredValue: {
              amount: pkg.value,
              currency: 'USD'
            }
          })),
          serviceType: this.mapServiceToFedEx(request.serviceLevel),
          packagingType: this.mapPackageTypeToFedEx(request.packages[0].type),
          pickupType: 'DROPOFF_AT_FEDEX_LOCATION'
        }
      })

      return this.parseFedExResponse(response.data)
    } catch (error) {
      console.error('FedEx API error:', error)
      return this.getFallbackQuotes('FedEx', request)
    }
  }

  // UPS Integration
  async getUPSQuotes(request: ShipmentRequest): Promise<CarrierQuote[]> {
    try {
      const response = await axios.post(`${this.baseURL}/carriers/ups/quotes`, {
        RateRequest: {
          Request: {
            RequestOption: 'Rate',
            TransactionReference: {
              CustomerContext: 'SonGo Enterprise Quote'
            }
          },
          Shipment: {
            Shipper: {
              Name: request.origin.company || request.origin.name,
              AttentionName: request.origin.name,
              Phone: { Number: request.origin.phone },
              Address: {
                AddressLine: [request.origin.address],
                City: request.origin.city,
                StateProvinceCode: request.origin.state,
                PostalCode: request.origin.zip,
                CountryCode: request.origin.country
              }
            },
            ShipTo: {
              Name: request.destination.company || request.destination.name,
              AttentionName: request.destination.name,
              Phone: { Number: request.destination.phone },
              Address: {
                AddressLine: [request.destination.address],
                City: request.destination.city,
                StateProvinceCode: request.destination.state,
                PostalCode: request.destination.zip,
                CountryCode: request.destination.country,
                ResidentialAddressIndicator: request.residentialDelivery ? 'Y' : 'N'
              }
            },
            Package: request.packages.map(pkg => ({
              PackagingType: { Code: this.mapPackageTypeToUPS(pkg.type) },
              Dimensions: {
                UnitOfMeasurement: { Code: pkg.dimensions.unit },
                Length: pkg.dimensions.length.toString(),
                Width: pkg.dimensions.width.toString(),
                Height: pkg.dimensions.height.toString()
              },
              PackageWeight: {
                UnitOfMeasurement: { Code: pkg.dimensions.weightUnit },
                Weight: pkg.dimensions.weight.toString()
              },
              PackageServiceOptions: {
                DeclaredValue: {
                  CurrencyCode: 'USD',
                  MonetaryValue: pkg.value.toString()
                }
              }
            })),
            Service: { Code: this.mapServiceToUPS(request.serviceLevel) }
          }
        }
      })

      return this.parseUPSResponse(response.data)
    } catch (error) {
      console.error('UPS API error:', error)
      return this.getFallbackQuotes('UPS', request)
    }
  }

  // DHL Integration
  async getDHLQuotes(request: ShipmentRequest): Promise<CarrierQuote[]> {
    try {
      const response = await axios.post(`${this.baseURL}/carriers/dhl/quotes`, {
        customerDetails: {
          shipperDetails: {
            postalAddress: {
              postalCode: request.origin.zip,
              cityName: request.origin.city,
              countryCode: request.origin.country,
              provinceCode: request.origin.state,
              addressLine1: request.origin.address
            },
            contactInformation: {
              phone: request.origin.phone,
              companyName: request.origin.company,
              fullName: request.origin.name
            }
          },
          receiverDetails: {
            postalAddress: {
              postalCode: request.destination.zip,
              cityName: request.destination.city,
              countryCode: request.destination.country,
              provinceCode: request.destination.state,
              addressLine1: request.destination.address
            },
            contactInformation: {
              phone: request.destination.phone,
              companyName: request.destination.company,
              fullName: request.destination.name
            }
          }
        },
        accounts: [{ typeCode: 'shipper', number: process.env.DHL_ACCOUNT_NUMBER }],
        productCode: this.mapServiceToDHL(request.serviceLevel),
        packages: request.packages.map(pkg => ({
          weight: pkg.dimensions.weight,
          dimensions: {
            length: pkg.dimensions.length,
            width: pkg.dimensions.width,
            height: pkg.dimensions.height
          }
        })),
        plannedShippingDateAndTime: request.pickupDate,
        unitOfMeasurement: request.packages[0].dimensions.unit === 'IN' ? 'imperial' : 'metric'
      })

      return this.parseDHLResponse(response.data)
    } catch (error) {
      console.error('DHL API error:', error)
      return this.getFallbackQuotes('DHL', request)
    }
  }

  // USPS Integration
  async getUSPSQuotes(request: ShipmentRequest): Promise<CarrierQuote[]> {
    try {
      // USPS uses XML API
      const xmlRequest = this.buildUSPSXMLRequest(request)
      const response = await axios.get(
        `https://secure.shippingapis.com/ShippingAPI.dll?API=RateV4&XML=${encodeURIComponent(xmlRequest)}`
      )

      return this.parseUSPSResponse(response.data)
    } catch (error) {
      console.error('USPS API error:', error)
      return this.getFallbackQuotes('USPS', request)
    }
  }

  // Get quotes from all carriers
  async getAllQuotes(request: ShipmentRequest): Promise<CarrierQuote[]> {
    const promises = [
      this.getFedExQuotes(request),
      this.getUPSQuotes(request),
      this.getDHLQuotes(request),
      this.getUSPSQuotes(request)
    ]

    try {
      const results = await Promise.allSettled(promises)
      const allQuotes: CarrierQuote[] = []

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allQuotes.push(...result.value)
        } else {
          console.error(`Carrier ${index} failed:`, result.reason)
        }
      })

      // Sort by price and add value scores
      return allQuotes
        .map(quote => ({
          ...quote,
          valueScore: this.calculateValueScore(quote)
        }))
        .sort((a, b) => a.price - b.price)
    } catch (error) {
      console.error('Error getting quotes from all carriers:', error)
      return []
    }
  }

  // Helper methods for service mapping
  private mapServiceToFedEx(service: string): string {
    const mapping: { [key: string]: string } = {
      'GROUND': 'FEDEX_GROUND',
      'EXPRESS': 'FEDEX_EXPRESS_SAVER',
      'OVERNIGHT': 'STANDARD_OVERNIGHT',
      'ECONOMY': 'FEDEX_GROUND',
      'INTERNATIONAL': 'INTERNATIONAL_ECONOMY'
    }
    return mapping[service] || 'FEDEX_GROUND'
  }

  private mapServiceToUPS(service: string): string {
    const mapping: { [key: string]: string } = {
      'GROUND': '03',
      'EXPRESS': '02',
      'OVERNIGHT': '01',
      'ECONOMY': '03',
      'INTERNATIONAL': '11'
    }
    return mapping[service] || '03'
  }

  private mapServiceToDHL(service: string): string {
    const mapping: { [key: string]: string } = {
      'GROUND': 'N',
      'EXPRESS': 'P',
      'OVERNIGHT': 'P',
      'ECONOMY': 'E',
      'INTERNATIONAL': 'P'
    }
    return mapping[service] || 'N'
  }

  private mapPackageTypeToFedEx(type: string): string {
    const mapping: { [key: string]: string } = {
      'PALLET': 'YOUR_PACKAGING',
      'PARCEL': 'YOUR_PACKAGING',
      'ENVELOPE': 'FEDEX_ENVELOPE',
      'BOX': 'FEDEX_BOX'
    }
    return mapping[type] || 'YOUR_PACKAGING'
  }

  private mapPackageTypeToUPS(type: string): string {
    const mapping: { [key: string]: string } = {
      'PALLET': '30',
      'PARCEL': '02',
      'ENVELOPE': '01',
      'BOX': '02'
    }
    return mapping[type] || '02'
  }

  // Response parsers
  private parseFedExResponse(data: any): CarrierQuote[] {
    // Implementation for parsing FedEx response
    return []
  }

  private parseUPSResponse(data: any): CarrierQuote[] {
    // Implementation for parsing UPS response
    return []
  }

  private parseDHLResponse(data: any): CarrierQuote[] {
    // Implementation for parsing DHL response
    return []
  }

  private parseUSPSResponse(data: any): CarrierQuote[] {
    // Implementation for parsing USPS response
    return []
  }

  private buildUSPSXMLRequest(request: ShipmentRequest): string {
    // Build USPS XML request
    return ''
  }

  // Fallback quotes for demo purposes
  private getFallbackQuotes(carrier: string, request: ShipmentRequest): CarrierQuote[] {
    const basePrice = this.calculateBasePrice(request)
    const multipliers = {
      'FedEx': { ground: 1.1, express: 1.8, overnight: 2.5 },
      'UPS': { ground: 1.05, express: 1.7, overnight: 2.3 },
      'DHL': { ground: 1.2, express: 1.9, overnight: 2.6 },
      'USPS': { ground: 0.8, express: 1.5, overnight: 2.0 }
    }

    const carrierMultipliers = multipliers[carrier as keyof typeof multipliers] || multipliers['FedEx']

    return [
      {
        id: `${carrier.toLowerCase()}-ground-${Date.now()}`,
        carrier,
        service: 'Ground',
        serviceCode: 'GND',
        price: Math.round(basePrice * carrierMultipliers.ground * 100) / 100,
        currency: 'USD',
        transitDays: 3,
        deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        features: ['Tracking Included', 'Insurance Available'],
        trackingIncluded: true,
        insuranceIncluded: false,
        signatureRequired: false,
        reliability: 4,
        fuelSurcharge: Math.round(basePrice * 0.1 * 100) / 100
      },
      {
        id: `${carrier.toLowerCase()}-express-${Date.now()}`,
        carrier,
        service: 'Express',
        serviceCode: 'EXP',
        price: Math.round(basePrice * carrierMultipliers.express * 100) / 100,
        currency: 'USD',
        transitDays: 1,
        deliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        features: ['Tracking Included', 'Insurance Included', 'Signature Required'],
        trackingIncluded: true,
        insuranceIncluded: true,
        signatureRequired: true,
        reliability: 5,
        guaranteedDelivery: true,
        fuelSurcharge: Math.round(basePrice * 0.15 * 100) / 100
      }
    ]
  }

  private calculateBasePrice(request: ShipmentRequest): number {
    let basePrice = 15 // Base shipping cost
    
    // Calculate total billable weight
    const totalWeight = request.packages.reduce((total, pkg) => {
      const actualWeight = pkg.dimensions.weightUnit === 'KG' 
        ? pkg.dimensions.weight * 2.20462 
        : pkg.dimensions.weight
      
      const dimWeight = this.calculateDimensionalWeight(pkg.dimensions)
      return total + Math.max(actualWeight, dimWeight)
    }, 0)
    
    basePrice += totalWeight * 0.75
    
    // Distance factor (simplified)
    if (request.origin.state !== request.destination.state) {
      basePrice *= 1.5
    }
    
    // Service level multiplier
    const serviceMultipliers = {
      'ECONOMY': 0.8,
      'GROUND': 1.0,
      'EXPRESS': 1.8,
      'OVERNIGHT': 2.5,
      'INTERNATIONAL': 2.0
    }
    
    basePrice *= serviceMultipliers[request.serviceLevel] || 1.0
    
    // Package type multiplier
    const hasLargePackages = request.packages.some(pkg => pkg.type === 'PALLET')
    if (hasLargePackages) {
      basePrice *= 1.3
    }
    
    return Math.round(basePrice * 100) / 100
  }

  private calculateDimensionalWeight(dimensions: Package['dimensions']): number {
    const { length, width, height, unit } = dimensions
    
    // Convert to inches if needed
    const lengthInches = unit === 'CM' ? length / 2.54 : length
    const widthInches = unit === 'CM' ? width / 2.54 : width
    const heightInches = unit === 'CM' ? height / 2.54 : height
    
    // Standard dimensional weight factor (166 for domestic, 139 for international)
    const dimFactor = 166
    
    return (lengthInches * widthInches * heightInches) / dimFactor
  }

  private calculateValueScore(quote: CarrierQuote): number {
    let score = 0
    
    // Price factor (lower is better)
    score += (100 - Math.min(quote.price, 100)) * 0.4
    
    // Transit time factor (faster is better)
    score += (10 - Math.min(quote.transitDays, 10)) * 10 * 0.3
    
    // Reliability factor
    score += quote.reliability * 20 * 0.2
    
    // Features factor
    score += quote.features.length * 2 * 0.1
    
    return Math.round(score)
  }
}
