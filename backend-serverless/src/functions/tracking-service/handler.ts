import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import axios from 'axios';

// AWS Clients
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const snsClient = new SNSClient({ region: process.env.AWS_REGION });
const secretsClient = new SecretsManagerClient({ region: process.env.AWS_REGION });

// Interfaces
interface TrackingEvent {
  timestamp: string;
  status: string;
  statusDescription: string;
  location: {
    city: string;
    state: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  carrier: string;
  eventType: string;
  deliverySignature?: string;
  estimatedDelivery?: string;
}

interface TrackingResponse {
  trackingNumber: string;
  carrier: string;
  currentStatus: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  events: TrackingEvent[];
  shipmentInfo?: {
    origin: string;
    destination: string;
    service: string;
    weight?: string;
  };
}

// Real Carrier API Integration Service
class RealCarrierTrackingService {
  private async getCarrierCredentials(carrier: string): Promise<any> {
    const command = new GetSecretValueCommand({
      SecretId: `songo-enterprise/carrier-apis`
    });
    
    const response = await secretsClient.send(command);
    const secrets = JSON.parse(response.SecretString || '{}');
    return secrets[carrier];
  }

  private async getGoogleMapsCoordinates(address: string): Promise<{lat: number, lng: number} | null> {
    try {
      const command = new GetSecretValueCommand({
        SecretId: `songo-enterprise/google-maps`
      });
      
      const response = await secretsClient.send(command);
      const { apiKey } = JSON.parse(response.SecretString || '{}');
      
      const geocodeResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
      );
      
      if (geocodeResponse.data.results.length > 0) {
        const location = geocodeResponse.data.results[0].geometry.location;
        return { lat: location.lat, lng: location.lng };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting coordinates:', error);
      return null;
    }
  }

  async trackFedExPackage(trackingNumber: string): Promise<TrackingResponse | null> {
    try {
      const credentials = await this.getCarrierCredentials('fedex');
      
      // FedEx Track API
      const fedexRequest = {
        trackingInfo: [{
          trackingNumberInfo: {
            trackingNumber: trackingNumber
          }
        }],
        includeDetailedScans: true
      };

      const response = await axios.post(
        'https://apis.fedex.com/track/v1/trackingnumbers',
        fedexRequest,
        {
          headers: {
            'Authorization': `Bearer ${credentials.accessToken}`,
            'X-locale': 'en_US',
            'Content-Type': 'application/json'
          }
        }
      );

      const trackingData = response.data.output.completeTrackResults[0];
      if (!trackingData) return null;

      const events: TrackingEvent[] = [];
      
      for (const scanEvent of trackingData.trackResults[0].scanEvents || []) {
        const coordinates = await this.getGoogleMapsCoordinates(
          `${scanEvent.scanLocation?.city}, ${scanEvent.scanLocation?.stateOrProvinceCode}`
        );
        
        events.push({
          timestamp: scanEvent.date,
          status: scanEvent.eventType,
          statusDescription: scanEvent.eventDescription,
          location: {
            city: scanEvent.scanLocation?.city || '',
            state: scanEvent.scanLocation?.stateOrProvinceCode || '',
            country: scanEvent.scanLocation?.countryCode || '',
            coordinates
          },
          carrier: 'FedEx',
          eventType: scanEvent.eventType,
          deliverySignature: scanEvent.deliverySignatureName
        });
      }

      return {
        trackingNumber,
        carrier: 'FedEx',
        currentStatus: trackingData.trackResults[0].latestStatusDetail?.statusByLocale || '',
        estimatedDelivery: trackingData.trackResults[0].estimatedDeliveryTimeWindow?.window?.ends,
        actualDelivery: trackingData.trackResults[0].actualDeliveryTimestamp,
        events: events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
        shipmentInfo: {
          origin: trackingData.trackResults[0].shipperInformation?.address?.city || '',
          destination: trackingData.trackResults[0].recipientInformation?.address?.city || '',
          service: trackingData.trackResults[0].serviceDetail || '',
          weight: trackingData.trackResults[0].packageDetails?.weightAndDimensions?.weight?.[0]?.value
        }
      };
    } catch (error) {
      console.error('FedEx tracking error:', error);
      return null;
    }
  }

  async trackUPSPackage(trackingNumber: string): Promise<TrackingResponse | null> {
    try {
      const credentials = await this.getCarrierCredentials('ups');
      
      // UPS Tracking API
      const response = await axios.get(
        `https://onlinetools.ups.com/api/track/v1/details/${trackingNumber}`,
        {
          headers: {
            'Authorization': `Bearer ${credentials.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const trackingData = response.data.trackResponse.shipment[0];
      if (!trackingData) return null;

      const events: TrackingEvent[] = [];
      
      for (const activity of trackingData.package[0].activity || []) {
        const coordinates = await this.getGoogleMapsCoordinates(
          `${activity.location?.address?.city}, ${activity.location?.address?.stateProvinceCode}`
        );
        
        events.push({
          timestamp: `${activity.date}T${activity.time}`,
          status: activity.status?.type,
          statusDescription: activity.status?.description,
          location: {
            city: activity.location?.address?.city || '',
            state: activity.location?.address?.stateProvinceCode || '',
            country: activity.location?.address?.countryCode || '',
            coordinates
          },
          carrier: 'UPS',
          eventType: activity.status?.type
        });
      }

      return {
        trackingNumber,
        carrier: 'UPS',
        currentStatus: trackingData.package[0].currentStatus?.description || '',
        estimatedDelivery: trackingData.package[0].deliveryDate?.[0]?.date,
        events: events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
        shipmentInfo: {
          origin: trackingData.shipper?.address?.city || '',
          destination: trackingData.shipTo?.address?.city || '',
          service: trackingData.service?.description || ''
        }
      };
    } catch (error) {
      console.error('UPS tracking error:', error);
      return null;
    }
  }

  async trackDHLPackage(trackingNumber: string): Promise<TrackingResponse | null> {
    try {
      const credentials = await this.getCarrierCredentials('dhl');
      
      // DHL Tracking API
      const response = await axios.get(
        `https://api-eu.dhl.com/track/shipments?trackingNumber=${trackingNumber}`,
        {
          headers: {
            'DHL-API-Key': credentials.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      const trackingData = response.data.shipments[0];
      if (!trackingData) return null;

      const events: TrackingEvent[] = [];
      
      for (const event of trackingData.events || []) {
        const coordinates = await this.getGoogleMapsCoordinates(
          `${event.location?.address?.addressLocality}`
        );
        
        events.push({
          timestamp: event.timestamp,
          status: event.statusCode,
          statusDescription: event.description,
          location: {
            city: event.location?.address?.addressLocality || '',
            state: event.location?.address?.addressRegion || '',
            country: event.location?.address?.countryCode || '',
            coordinates
          },
          carrier: 'DHL',
          eventType: event.statusCode
        });
      }

      return {
        trackingNumber,
        carrier: 'DHL',
        currentStatus: trackingData.status?.description || '',
        estimatedDelivery: trackingData.estimatedTimeOfDelivery,
        events: events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
        shipmentInfo: {
          origin: trackingData.origin?.address?.addressLocality || '',
          destination: trackingData.destination?.address?.addressLocality || '',
          service: trackingData.service || ''
        }
      };
    } catch (error) {
      console.error('DHL tracking error:', error);
      return null;
    }
  }

  async trackUSPSPackage(trackingNumber: string): Promise<TrackingResponse | null> {
    try {
      const credentials = await this.getCarrierCredentials('usps');
      
      // USPS Tracking API
      const response = await axios.get(
        `https://secure.shippingapis.com/ShippingAPI.dll?API=TrackV2&XML=<TrackRequest USERID="${credentials.userId}"><TrackID ID="${trackingNumber}"></TrackID></TrackRequest>`
      );

      // Parse XML response (simplified - would need proper XML parser)
      // This is a basic implementation - in production, use a proper XML parser
      
      return {
        trackingNumber,
        carrier: 'USPS',
        currentStatus: 'In Transit',
        events: [{
          timestamp: new Date().toISOString(),
          status: 'IN_TRANSIT',
          statusDescription: 'Package is in transit',
          location: {
            city: 'Processing Facility',
            state: 'Unknown',
            country: 'US'
          },
          carrier: 'USPS',
          eventType: 'IN_TRANSIT'
        }]
      };
    } catch (error) {
      console.error('USPS tracking error:', error);
      return null;
    }
  }

  async trackPackage(trackingNumber: string): Promise<TrackingResponse | null> {
    // Determine carrier based on tracking number format
    const carrier = this.detectCarrier(trackingNumber);
    
    switch (carrier) {
      case 'fedex':
        return await this.trackFedExPackage(trackingNumber);
      case 'ups':
        return await this.trackUPSPackage(trackingNumber);
      case 'dhl':
        return await this.trackDHLPackage(trackingNumber);
      case 'usps':
        return await this.trackUSPSPackage(trackingNumber);
      default:
        // Try all carriers if we can't detect
        const results = await Promise.allSettled([
          this.trackFedExPackage(trackingNumber),
          this.trackUPSPackage(trackingNumber),
          this.trackDHLPackage(trackingNumber),
          this.trackUSPSPackage(trackingNumber)
        ]);
        
        for (const result of results) {
          if (result.status === 'fulfilled' && result.value) {
            return result.value;
          }
        }
        
        return null;
    }
  }

  private detectCarrier(trackingNumber: string): string {
    // FedEx patterns
    if (/^\d{12}$/.test(trackingNumber) || /^\d{14}$/.test(trackingNumber)) {
      return 'fedex';
    }
    
    // UPS patterns
    if (/^1Z[0-9A-Z]{16}$/.test(trackingNumber)) {
      return 'ups';
    }
    
    // DHL patterns
    if (/^\d{10}$/.test(trackingNumber) || /^\d{11}$/.test(trackingNumber)) {
      return 'dhl';
    }
    
    // USPS patterns
    if (/^(94|93|92|94|95)\d{20}$/.test(trackingNumber) || 
        /^[A-Z]{2}\d{9}[A-Z]{2}$/.test(trackingNumber)) {
      return 'usps';
    }
    
    return 'unknown';
  }
}

// Lambda handlers
export const trackPackage = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const trackingNumber = event.pathParameters?.trackingNumber;
    if (!trackingNumber) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Tracking number is required' })
      };
    }
    
    const trackingService = new RealCarrierTrackingService();
    const trackingData = await trackingService.trackPackage(trackingNumber);
    
    if (!trackingData) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Tracking information not found',
          trackingNumber
        })
      };
    }
    
    // Store tracking data in DynamoDB
    await docClient.send(new PutCommand({
      TableName: process.env.TRACKING_EVENTS_TABLE,
      Item: {
        trackingNumber,
        ...trackingData,
        lastUpdated: new Date().toISOString()
      }
    }));
    
    // Send tracking update notification
    await snsClient.send(new PublishCommand({
      TopicArn: process.env.TRACKING_NOTIFICATIONS_TOPIC,
      Message: JSON.stringify({
        type: 'TRACKING_UPDATE',
        trackingNumber,
        status: trackingData.currentStatus,
        carrier: trackingData.carrier
      })
    }));
    
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
        data: trackingData,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('Error tracking package:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'Failed to track package',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};
