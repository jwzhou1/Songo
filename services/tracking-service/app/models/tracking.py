"""
Tracking models for DynamoDB
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
import uuid

class TrackingStatus(str, Enum):
    """Tracking status enumeration"""
    LABEL_CREATED = "LABEL_CREATED"
    PICKED_UP = "PICKED_UP"
    IN_TRANSIT = "IN_TRANSIT"
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY"
    DELIVERED = "DELIVERED"
    EXCEPTION = "EXCEPTION"
    RETURNED = "RETURNED"
    CANCELLED = "CANCELLED"

class CarrierType(str, Enum):
    """Supported carriers"""
    FEDEX = "FEDEX"
    UPS = "UPS"
    DHL = "DHL"
    USPS = "USPS"
    CANADA_POST = "CANADA_POST"
    PUROLATOR = "PUROLATOR"

class LocationCoordinates(BaseModel):
    """GPS coordinates for tracking locations"""
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    accuracy: Optional[float] = None

class TrackingLocation(BaseModel):
    """Location information for tracking events"""
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    coordinates: Optional[LocationCoordinates] = None
    facility_name: Optional[str] = None
    facility_type: Optional[str] = None  # ORIGIN, DESTINATION, HUB, SORT_FACILITY

class TrackingEvent(BaseModel):
    """Individual tracking event"""
    event_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: datetime
    status: TrackingStatus
    description: str
    location: Optional[TrackingLocation] = None
    carrier_code: Optional[str] = None
    carrier_description: Optional[str] = None
    exception_code: Optional[str] = None
    exception_description: Optional[str] = None
    signature_name: Optional[str] = None
    delivery_instructions: Optional[str] = None
    estimated_delivery: Optional[datetime] = None
    raw_data: Optional[Dict[str, Any]] = None  # Store original carrier response

class ShipmentTracking(BaseModel):
    """Main tracking record stored in DynamoDB"""
    tracking_number: str = Field(..., min_length=1)
    carrier: CarrierType
    service_type: Optional[str] = None
    
    # Shipment details
    origin: Optional[TrackingLocation] = None
    destination: Optional[TrackingLocation] = None
    
    # Current status
    current_status: TrackingStatus
    current_location: Optional[TrackingLocation] = None
    estimated_delivery: Optional[datetime] = None
    actual_delivery: Optional[datetime] = None
    
    # Events timeline
    events: List[TrackingEvent] = Field(default_factory=list)
    
    # Package details
    weight: Optional[float] = None
    weight_unit: Optional[str] = "LBS"
    dimensions: Optional[Dict[str, float]] = None  # length, width, height
    package_count: Optional[int] = 1
    
    # Customer information
    customer_id: Optional[str] = None
    reference_number: Optional[str] = None
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_checked: Optional[datetime] = None
    check_frequency: int = 60  # minutes
    
    # Notifications
    notification_preferences: Optional[Dict[str, bool]] = Field(
        default_factory=lambda: {
            "email": True,
            "sms": False,
            "push": True,
            "webhook": False
        }
    )
    notification_endpoints: Optional[Dict[str, str]] = None
    
    # Route information for maps
    route_points: List[LocationCoordinates] = Field(default_factory=list)
    estimated_route: Optional[List[LocationCoordinates]] = None
    
    class Config:
        use_enum_values = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class TrackingRequest(BaseModel):
    """Request model for tracking lookup"""
    tracking_number: str = Field(..., min_length=1)
    carrier: Optional[CarrierType] = None
    customer_id: Optional[str] = None

class TrackingResponse(BaseModel):
    """Response model for tracking data"""
    tracking_number: str
    carrier: CarrierType
    current_status: TrackingStatus
    current_location: Optional[TrackingLocation] = None
    estimated_delivery: Optional[datetime] = None
    actual_delivery: Optional[datetime] = None
    events: List[TrackingEvent]
    route_points: List[LocationCoordinates] = Field(default_factory=list)
    last_updated: datetime

class BulkTrackingRequest(BaseModel):
    """Request model for bulk tracking lookup"""
    tracking_numbers: List[str] = Field(..., min_items=1, max_items=100)
    carrier: Optional[CarrierType] = None
    customer_id: Optional[str] = None

class TrackingMapData(BaseModel):
    """Map data for tracking visualization"""
    tracking_number: str
    current_location: Optional[LocationCoordinates] = None
    origin: Optional[LocationCoordinates] = None
    destination: Optional[LocationCoordinates] = None
    route_points: List[LocationCoordinates] = Field(default_factory=list)
    estimated_route: Optional[List[LocationCoordinates]] = None
    delivery_radius: Optional[float] = None  # km

class TrackingNotification(BaseModel):
    """Notification model for tracking updates"""
    tracking_number: str
    carrier: CarrierType
    event: TrackingEvent
    customer_id: Optional[str] = None
    notification_type: str  # EMAIL, SMS, PUSH, WEBHOOK
    recipient: str
    template: Optional[str] = None

class CarrierTrackingConfig(BaseModel):
    """Configuration for carrier tracking APIs"""
    carrier: CarrierType
    api_endpoint: str
    api_key: str
    rate_limit: int = 100  # requests per minute
    timeout: int = 30  # seconds
    retry_attempts: int = 3
    enabled: bool = True

# DynamoDB table schemas
TRACKING_TABLE_SCHEMA = {
    "TableName": "shipment_tracking",
    "KeySchema": [
        {"AttributeName": "tracking_number", "KeyType": "HASH"},
        {"AttributeName": "carrier", "KeyType": "RANGE"}
    ],
    "AttributeDefinitions": [
        {"AttributeName": "tracking_number", "AttributeType": "S"},
        {"AttributeName": "carrier", "AttributeType": "S"},
        {"AttributeName": "customer_id", "AttributeType": "S"},
        {"AttributeName": "current_status", "AttributeType": "S"}
    ],
    "GlobalSecondaryIndexes": [
        {
            "IndexName": "customer-index",
            "KeySchema": [
                {"AttributeName": "customer_id", "KeyType": "HASH"},
                {"AttributeName": "tracking_number", "KeyType": "RANGE"}
            ],
            "Projection": {"ProjectionType": "ALL"}
        },
        {
            "IndexName": "status-index",
            "KeySchema": [
                {"AttributeName": "current_status", "KeyType": "HASH"},
                {"AttributeName": "tracking_number", "KeyType": "RANGE"}
            ],
            "Projection": {"ProjectionType": "ALL"}
        }
    ],
    "BillingMode": "PAY_PER_REQUEST"
}
