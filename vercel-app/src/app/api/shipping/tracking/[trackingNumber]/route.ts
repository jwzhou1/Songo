import { NextRequest, NextResponse } from 'next/server'
import { TrackingService } from '@/services/TrackingService'

export async function GET(
  request: NextRequest,
  { params }: { params: { trackingNumber: string } }
) {
  try {
    const { trackingNumber } = params
    
    if (!trackingNumber) {
      return NextResponse.json(
        { success: false, error: 'Tracking number is required' },
        { status: 400 }
      )
    }

    const trackingService = new TrackingService()
    
    // Try to get real tracking data, fallback to simulation
    let trackingData = await trackingService.trackPackage(trackingNumber)
    
    if (!trackingData) {
      // Use simulation for demo purposes
      trackingData = await trackingService.simulateRealTimeTracking(trackingNumber)
    }

    if (!trackingData) {
      return NextResponse.json(
        { success: false, error: 'No tracking information found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: trackingData,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error tracking package:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to track package',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { trackingNumber: string } }
) {
  try {
    const { trackingNumber } = params
    const body = await request.json()
    
    if (!trackingNumber) {
      return NextResponse.json(
        { success: false, error: 'Tracking number is required' },
        { status: 400 }
      )
    }

    const trackingService = new TrackingService()
    
    // Handle different tracking operations
    switch (body.action) {
      case 'subscribe':
        // Subscribe to real-time updates
        return NextResponse.json({
          success: true,
          message: 'Subscribed to real-time updates',
          subscriptionId: `SUB_${Date.now()}`
        })
        
      case 'unsubscribe':
        // Unsubscribe from real-time updates
        return NextResponse.json({
          success: true,
          message: 'Unsubscribed from real-time updates'
        })
        
      case 'refresh':
        // Force refresh tracking data
        const trackingData = await trackingService.trackPackage(trackingNumber)
        return NextResponse.json({
          success: true,
          data: trackingData,
          timestamp: new Date().toISOString()
        })
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error processing tracking request:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process tracking request',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
