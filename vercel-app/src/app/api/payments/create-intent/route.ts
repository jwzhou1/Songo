import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, currency = 'usd', metadata, shipping, customer, setup_future_usage } = body

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid amount' },
        { status: 400 }
      )
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount should be in cents
      currency: currency.toLowerCase(),
      metadata: {
        ...metadata,
        platform: 'SonGo Enterprise',
        timestamp: new Date().toISOString()
      },
      shipping: shipping ? {
        name: shipping.name,
        address: {
          line1: shipping.address.line1,
          line2: shipping.address.line2,
          city: shipping.address.city,
          state: shipping.address.state,
          postal_code: shipping.address.postal_code,
          country: shipping.address.country
        }
      } : undefined,
      customer: customer || undefined,
      setup_future_usage: setup_future_usage || undefined,
      automatic_payment_methods: {
        enabled: true
      }
    })

    return NextResponse.json({
      success: true,
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { 
          success: false, 
          error: {
            code: error.code,
            message: error.message,
            type: error.type
          }
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: {
          code: 'processing_error',
          message: 'Failed to create payment intent',
          type: 'api_error'
        }
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const paymentIntentId = searchParams.get('payment_intent_id')

  if (!paymentIntentId) {
    return NextResponse.json(
      { success: false, error: 'Payment intent ID is required' },
      { status: 400 }
    )
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    return NextResponse.json({
      success: true,
      payment_intent: {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        client_secret: paymentIntent.client_secret,
        created: paymentIntent.created,
        metadata: paymentIntent.metadata
      }
    })
  } catch (error) {
    console.error('Error retrieving payment intent:', error)
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { 
          success: false, 
          error: {
            code: error.code,
            message: error.message,
            type: error.type
          }
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: {
          code: 'processing_error',
          message: 'Failed to retrieve payment intent',
          type: 'api_error'
        }
      },
      { status: 500 }
    )
  }
}
