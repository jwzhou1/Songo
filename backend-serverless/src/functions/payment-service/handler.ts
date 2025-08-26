import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';

// AWS Clients
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const snsClient = new SNSClient({ region: process.env.AWS_REGION });
const secretsClient = new SecretsManagerClient({ region: process.env.AWS_REGION });

// Interfaces
interface PaymentRequest {
  quoteId: string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethodId: string;
  billingAddress: {
    name: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

interface PaymentResponse {
  paymentId: string;
  status: 'succeeded' | 'failed' | 'processing';
  amount: number;
  currency: string;
  receiptUrl?: string;
  error?: string;
}

// Stripe Payment Service
class StripePaymentService {
  private stripe: Stripe;

  constructor(secretKey: string) {
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2023-10-16'
    });
  }

  async createPaymentIntent(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(request.amount * 100), // Convert to cents
        currency: request.currency.toLowerCase(),
        payment_method: request.paymentMethodId,
        confirmation_method: 'manual',
        confirm: true,
        return_url: `${process.env.FRONTEND_URL}/payment/success`,
        metadata: {
          quoteId: request.quoteId,
          userId: request.userId
        },
        shipping: {
          name: request.billingAddress.name,
          address: {
            line1: request.billingAddress.address,
            city: request.billingAddress.city,
            state: request.billingAddress.state,
            postal_code: request.billingAddress.zip,
            country: request.billingAddress.country
          }
        }
      });

      return {
        paymentId: paymentIntent.id,
        status: paymentIntent.status as 'succeeded' | 'failed' | 'processing',
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        receiptUrl: paymentIntent.charges.data[0]?.receipt_url
      };
    } catch (error) {
      console.error('Stripe payment error:', error);
      return {
        paymentId: '',
        status: 'failed',
        amount: request.amount,
        currency: request.currency,
        error: error instanceof Error ? error.message : 'Payment failed'
      };
    }
  }

  async createCustomer(email: string, name: string): Promise<string> {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name
      });
      return customer.id;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw error;
    }
  }

  async attachPaymentMethod(paymentMethodId: string, customerId: string): Promise<void> {
    try {
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId
      });
    } catch (error) {
      console.error('Error attaching payment method:', error);
      throw error;
    }
  }

  async getPaymentMethods(customerId: string): Promise<any[]> {
    try {
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: 'card'
      });
      return paymentMethods.data;
    } catch (error) {
      console.error('Error getting payment methods:', error);
      return [];
    }
  }
}

// Lambda handlers
export const processPayment = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const request: PaymentRequest = JSON.parse(event.body || '{}');
    
    // Validate request
    if (!request.quoteId || !request.userId || !request.amount || !request.paymentMethodId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Missing required payment information'
        })
      };
    }

    // Get Stripe credentials
    const command = new GetSecretValueCommand({
      SecretId: `songo-enterprise/stripe`
    });
    const response = await secretsClient.send(command);
    const { secretKey } = JSON.parse(response.SecretString || '{}');

    // Initialize Stripe service
    const stripeService = new StripePaymentService(secretKey);
    
    // Process payment
    const paymentResult = await stripeService.createPaymentIntent(request);
    
    // Store payment record in DynamoDB
    const paymentRecord = {
      paymentId: paymentResult.paymentId || uuidv4(),
      quoteId: request.quoteId,
      userId: request.userId,
      amount: request.amount,
      currency: request.currency,
      status: paymentResult.status,
      billingAddress: request.billingAddress,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      receiptUrl: paymentResult.receiptUrl,
      error: paymentResult.error
    };

    await docClient.send(new PutCommand({
      TableName: process.env.PAYMENTS_TABLE,
      Item: paymentRecord
    }));

    // Update quote status if payment succeeded
    if (paymentResult.status === 'succeeded') {
      await docClient.send(new UpdateCommand({
        TableName: process.env.QUOTES_TABLE,
        Key: { quoteId: request.quoteId, userId: request.userId },
        UpdateExpression: 'SET #status = :status, #paidAt = :paidAt, #paymentId = :paymentId',
        ExpressionAttributeNames: {
          '#status': 'status',
          '#paidAt': 'paidAt',
          '#paymentId': 'paymentId'
        },
        ExpressionAttributeValues: {
          ':status': 'PAID',
          ':paidAt': new Date().toISOString(),
          ':paymentId': paymentResult.paymentId
        }
      }));

      // Send payment success notification
      await snsClient.send(new PublishCommand({
        TopicArn: process.env.PAYMENT_NOTIFICATIONS_TOPIC,
        Message: JSON.stringify({
          type: 'PAYMENT_SUCCESS',
          paymentId: paymentResult.paymentId,
          quoteId: request.quoteId,
          userId: request.userId,
          amount: request.amount,
          currency: request.currency
        })
      }));
    }

    return {
      statusCode: paymentResult.status === 'succeeded' ? 200 : 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
      },
      body: JSON.stringify({
        success: paymentResult.status === 'succeeded',
        data: paymentResult,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('Error processing payment:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'Failed to process payment',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

export const createPaymentMethod = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { userId, paymentMethodId } = JSON.parse(event.body || '{}');
    
    if (!userId || !paymentMethodId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'User ID and payment method ID are required' })
      };
    }

    // Get Stripe credentials
    const command = new GetSecretValueCommand({
      SecretId: `songo-enterprise/stripe`
    });
    const response = await secretsClient.send(command);
    const { secretKey } = JSON.parse(response.SecretString || '{}');

    const stripeService = new StripePaymentService(secretKey);
    
    // Create or get customer
    const customerId = await stripeService.createCustomer(
      `user-${userId}@songo.com`,
      `User ${userId}`
    );
    
    // Attach payment method to customer
    await stripeService.attachPaymentMethod(paymentMethodId, customerId);
    
    // Store customer ID in user record
    await docClient.send(new UpdateCommand({
      TableName: process.env.USERS_TABLE,
      Key: { userId },
      UpdateExpression: 'SET #customerId = :customerId',
      ExpressionAttributeNames: {
        '#customerId': 'stripeCustomerId'
      },
      ExpressionAttributeValues: {
        ':customerId': customerId
      }
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        customerId,
        paymentMethodId
      })
    };
  } catch (error) {
    console.error('Error creating payment method:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'Failed to create payment method'
      })
    };
  }
};

export const getPaymentMethods = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.pathParameters?.userId;
    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'User ID is required' })
      };
    }

    // Get user's Stripe customer ID
    const userResult = await docClient.send(new GetCommand({
      TableName: process.env.USERS_TABLE,
      Key: { userId }
    }));

    if (!userResult.Item?.stripeCustomerId) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: true,
          paymentMethods: []
        })
      };
    }

    // Get Stripe credentials
    const command = new GetSecretValueCommand({
      SecretId: `songo-enterprise/stripe`
    });
    const response = await secretsClient.send(command);
    const { secretKey } = JSON.parse(response.SecretString || '{}');

    const stripeService = new StripePaymentService(secretKey);
    const paymentMethods = await stripeService.getPaymentMethods(userResult.Item.stripeCustomerId);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        paymentMethods
      })
    };
  } catch (error) {
    console.error('Error getting payment methods:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'Failed to get payment methods'
      })
    };
  }
};
