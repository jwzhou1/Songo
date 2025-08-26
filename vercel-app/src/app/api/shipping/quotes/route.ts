import { NextRequest, NextResponse } from 'next/server'
import { CarrierService } from '@/services/CarrierService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const carrierService = new CarrierService()
    
    // Validate request body
    if (!body.origin || !body.destination || !body.packages || body.packages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get quotes from all carriers
    const quotes = await carrierService.getAllQuotes(body)
    
    return NextResponse.json({
      success: true,
      quotes,
      requestId: `REQ_${Date.now()}`,
      timestamp: new Date().toISOString(),
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    })
  } catch (error) {
    console.error('Error getting quotes:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get quotes',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const origin = searchParams.get('origin')
  const destination = searchParams.get('destination')
  const weight = searchParams.get('weight')
  const service = searchParams.get('service') || 'GROUND'

  if (!origin || !destination || !weight) {
    return NextResponse.json(
      { success: false, error: 'Missing required parameters' },
      { status: 400 }
    )
  }

  try {
    const carrierService = new CarrierService()
    
    // Create a simple quote request from query parameters
    const quoteRequest = {
      origin: {
        name: 'Sender',
        address: origin,
        city: origin.split(',')[0] || '',
        state: origin.split(',')[1]?.trim() || '',
        zip: '10001',
        country: 'US'
      },
      destination: {
        name: 'Recipient',
        address: destination,
        city: destination.split(',')[0] || '',
        state: destination.split(',')[1]?.trim() || '',
        zip: '90001',
        country: 'US'
      },
      packages: [{
        type: 'PARCEL' as const,
        dimensions: {
          length: 12,
          width: 12,
          height: 12,
          weight: parseFloat(weight),
          unit: 'IN' as const,
          weightUnit: 'LB' as const
        },
        value: 100,
        contents: 'General merchandise'
      }],
      serviceLevel: service as any,
      pickupDate: new Date().toISOString().split('T')[0]
    }

    const quotes = await carrierService.getAllQuotes(quoteRequest)
    
    return NextResponse.json({
      success: true,
      quotes,
      requestId: `REQ_${Date.now()}`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error getting quick quotes:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get quotes',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
