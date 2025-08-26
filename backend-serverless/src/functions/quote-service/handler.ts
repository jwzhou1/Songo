import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { v4 as uuidv4 } from 'uuid';

// AWS Clients
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const snsClient = new SNSClient({ region: process.env.AWS_REGION });
const secretsClient = new SecretsManagerClient({ region: process.env.AWS_REGION });

// Interfaces
interface QuoteRequest {
  origin: Address;
  destination: Address;
  packages: Package[];
  serviceLevel: 'GROUND' | 'EXPRESS' | 'OVERNIGHT';
  userId?: string;
}

interface Address {
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface Package {
  type: 'PALLET' | 'PARCEL';
  dimensions: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
  value: number;
  contents: string;
}

interface CarrierQuote {
  carrier: string;
  service: string;
  price: number;
  transitDays: number;
  deliveryDate: string;
}

// Carrier API integrations
class CarrierService {
  private async getCarrierCredentials(carrier: string): Promise<any> {
    const command = new GetSecretValueCommand({
      SecretId: `songo-enterprise/carrier-apis`
    });
    
    const response = await secretsClient.send(command);
    const secrets = JSON.parse(response.SecretString || '{}');
    return secrets[carrier];
  }

  async getFedExQuote(request: QuoteRequest): Promise<CarrierQuote[]> {
    try {
      const credentials = await this.getCarrierCredentials('fedex');
      
      // FedEx API integration
      const fedexRequest = {
        accountNumber: credentials.accountNumber,
        meterNumber: credentials.meterNumber,
        requestedShipment: {
          shipper: {
            address: {
              streetLines: [request.origin.address],
              city: request.origin.city,
              stateOrProvinceCode: request.origin.state,
              postalCode: request.origin.zip,
              countryCode: request.origin.country
            }
          },
          recipient: {
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
              units: 'LB',
              value: pkg.dimensions.weight
            },
            dimensions: {
              length: pkg.dimensions.length,
              width: pkg.dimensions.width,
              height: pkg.dimensions.height,
              units: 'IN'
            }
          }))
        }
      };

      // Simulate FedEx API call (replace with actual API call)
      const basePrice = this.calculateBasePrice(request);
      return [
        {
          carrier: 'FedEx',
          service: 'Ground',
          price: basePrice * 1.1,
          transitDays: 3,
          deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          carrier: 'FedEx',
          service: 'Express',
          price: basePrice * 1.8,
          transitDays: 1,
          deliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
    } catch (error) {
      console.error('FedEx API error:', error);
      return [];
    }
  }

  async getUPSQuote(request: QuoteRequest): Promise<CarrierQuote[]> {
    try {
      const credentials = await this.getCarrierCredentials('ups');
      
      // UPS API integration
      const basePrice = this.calculateBasePrice(request);
      return [
        {
          carrier: 'UPS',
          service: 'Ground',
          price: basePrice * 1.05,
          transitDays: 3,
          deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          carrier: 'UPS',
          service: 'Next Day Air',
          price: basePrice * 2.0,
          transitDays: 1,
          deliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
    } catch (error) {
      console.error('UPS API error:', error);
      return [];
    }
  }

  async getDHLQuote(request: QuoteRequest): Promise<CarrierQuote[]> {
    try {
      const credentials = await this.getCarrierCredentials('dhl');
      
      // DHL API integration
      const basePrice = this.calculateBasePrice(request);
      return [
        {
          carrier: 'DHL',
          service: 'Express',
          price: basePrice * 1.9,
          transitDays: 2,
          deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
    } catch (error) {
      console.error('DHL API error:', error);
      return [];
    }
  }

  async getUSPSQuote(request: QuoteRequest): Promise<CarrierQuote[]> {
    try {
      const credentials = await this.getCarrierCredentials('usps');
      
      // USPS API integration
      const basePrice = this.calculateBasePrice(request);
      return [
        {
          carrier: 'USPS',
          service: 'Priority Mail',
          price: basePrice * 0.8,
          transitDays: 2,
          deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          carrier: 'USPS',
          service: 'Express Mail',
          price: basePrice * 1.5,
          transitDays: 1,
          deliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
    } catch (error) {
      console.error('USPS API error:', error);
      return [];
    }
  }

  private calculateBasePrice(request: QuoteRequest): number {
    let basePrice = 50; // Base shipping cost
    
    // Calculate based on package dimensions and weight
    for (const pkg of request.packages) {
      const { length, width, height, weight } = pkg.dimensions;
      const dimensionalWeight = (length * width * height) / 166; // DIM weight factor
      const billableWeight = Math.max(weight, dimensionalWeight);
      
      basePrice += billableWeight * 0.5; // $0.50 per lb
      
      if (pkg.type === 'PALLET') {
        basePrice += 100; // Pallet handling fee
      }
    }
    
    // Distance factor (simplified)
    if (request.origin.state !== request.destination.state) {
      basePrice *= 1.5;
    }
    
    return Math.round(basePrice * 100) / 100;
  }

  async getAllQuotes(request: QuoteRequest): Promise<CarrierQuote[]> {
    const [fedexQuotes, upsQuotes, dhlQuotes, uspsQuotes] = await Promise.all([
      this.getFedExQuote(request),
      this.getUPSQuote(request),
      this.getDHLQuote(request),
      this.getUSPSQuote(request)
    ]);

    return [...fedexQuotes, ...upsQuotes, ...dhlQuotes, ...uspsQuotes]
      .sort((a, b) => a.price - b.price); // Sort by price
  }
}

// Lambda handlers
export const getQuotes = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const request: QuoteRequest = JSON.parse(event.body || '{}');
    const carrierService = new CarrierService();
    
    // Get quotes from all carriers
    const quotes = await carrierService.getAllQuotes(request);
    
    // If user is authenticated, save quote to database
    if (request.userId) {
      const quoteId = uuidv4();
      const quoteRecord = {
        quoteId,
        userId: request.userId,
        request,
        quotes,
        status: 'QUOTED',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      };
      
      await docClient.send(new PutCommand({
        TableName: process.env.QUOTES_TABLE,
        Item: quoteRecord
      }));
      
      // Send notification
      await snsClient.send(new PublishCommand({
        TopicArn: process.env.QUOTE_NOTIFICATIONS_TOPIC,
        Message: JSON.stringify({
          type: 'QUOTE_GENERATED',
          quoteId,
          userId: request.userId,
          quotesCount: quotes.length
        })
      }));
    }
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        quotes,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('Error getting quotes:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'Failed to get quotes',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

export const getUserQuotes = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.pathParameters?.userId;
    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'User ID is required' })
      };
    }
    
    const result = await docClient.send(new QueryCommand({
      TableName: process.env.QUOTES_TABLE,
      IndexName: 'UserStatusIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false // Most recent first
    }));
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        quotes: result.Items || [],
        count: result.Count || 0
      })
    };
  } catch (error) {
    console.error('Error getting user quotes:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'Failed to get user quotes'
      })
    };
  }
};
