/**
 * Payment models and interfaces for the payment service
 */

export enum PaymentStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED',
    REFUNDED = 'REFUNDED',
    PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED'
}

export enum PaymentMethod {
    CREDIT_CARD = 'CREDIT_CARD',
    DEBIT_CARD = 'DEBIT_CARD',
    PAYPAL = 'PAYPAL',
    BANK_TRANSFER = 'BANK_TRANSFER',
    DIGITAL_WALLET = 'DIGITAL_WALLET'
}

export enum PaymentProvider {
    STRIPE = 'STRIPE',
    PAYPAL = 'PAYPAL',
    SQUARE = 'SQUARE'
}

export enum Currency {
    USD = 'USD',
    CAD = 'CAD',
    EUR = 'EUR',
    GBP = 'GBP'
}

export interface Address {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

export interface CardDetails {
    last4: string;
    brand: string;
    expMonth: number;
    expYear: number;
    fingerprint?: string;
}

export interface BillingDetails {
    name: string;
    email: string;
    phone?: string;
    address: Address;
}

export interface PaymentIntent {
    id: string;
    amount: number;
    currency: Currency;
    status: PaymentStatus;
    paymentMethod: PaymentMethod;
    provider: PaymentProvider;
    providerId: string; // Stripe payment intent ID, PayPal order ID, etc.
    customerId: string;
    quoteId?: string;
    invoiceId?: string;
    description: string;
    billingDetails: BillingDetails;
    cardDetails?: CardDetails;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
    failureReason?: string;
    refundAmount?: number;
    refundReason?: string;
}

export interface CreatePaymentRequest {
    amount: number;
    currency: Currency;
    paymentMethod: PaymentMethod;
    customerId: string;
    quoteId?: string;
    description: string;
    billingDetails: BillingDetails;
    paymentMethodId?: string; // For Stripe
    paypalOrderId?: string; // For PayPal
    metadata?: Record<string, any>;
    savePaymentMethod?: boolean;
}

export interface PaymentResponse {
    paymentId: string;
    status: PaymentStatus;
    amount: number;
    currency: Currency;
    clientSecret?: string; // For Stripe
    approvalUrl?: string; // For PayPal
    message: string;
    metadata?: Record<string, any>;
}

export interface RefundRequest {
    paymentId: string;
    amount?: number; // If not provided, full refund
    reason: string;
    metadata?: Record<string, any>;
}

export interface RefundResponse {
    refundId: string;
    paymentId: string;
    amount: number;
    status: string;
    reason: string;
    createdAt: Date;
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    customerId: string;
    quoteId?: string;
    amount: number;
    currency: Currency;
    status: InvoiceStatus;
    dueDate: Date;
    paidAt?: Date;
    items: InvoiceItem[];
    billingDetails: BillingDetails;
    paymentIntentId?: string;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export enum InvoiceStatus {
    DRAFT = 'DRAFT',
    SENT = 'SENT',
    PAID = 'PAID',
    OVERDUE = 'OVERDUE',
    CANCELLED = 'CANCELLED'
}

export interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    metadata?: Record<string, any>;
}

export interface CreateInvoiceRequest {
    customerId: string;
    quoteId?: string;
    items: InvoiceItem[];
    billingDetails: BillingDetails;
    dueDate: Date;
    metadata?: Record<string, any>;
}

export interface PaymentMethod {
    id: string;
    customerId: string;
    type: PaymentMethod;
    provider: PaymentProvider;
    providerId: string;
    cardDetails?: CardDetails;
    billingDetails: BillingDetails;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Customer {
    id: string;
    email: string;
    name: string;
    phone?: string;
    address?: Address;
    stripeCustomerId?: string;
    paypalCustomerId?: string;
    defaultPaymentMethodId?: string;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export interface PaymentAnalytics {
    totalRevenue: number;
    totalTransactions: number;
    averageTransactionValue: number;
    successRate: number;
    refundRate: number;
    topPaymentMethods: Array<{
        method: PaymentMethod;
        count: number;
        percentage: number;
    }>;
    monthlyRevenue: Array<{
        month: string;
        revenue: number;
        transactions: number;
    }>;
    failureReasons: Array<{
        reason: string;
        count: number;
        percentage: number;
    }>;
}

export interface WebhookEvent {
    id: string;
    provider: PaymentProvider;
    eventType: string;
    data: any;
    processed: boolean;
    processedAt?: Date;
    createdAt: Date;
    signature?: string;
}

// DynamoDB table schemas
export const PAYMENT_TABLE_SCHEMA = {
    TableName: 'payments',
    KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' },
        { AttributeName: 'customerId', AttributeType: 'S' },
        { AttributeName: 'status', AttributeType: 'S' },
        { AttributeName: 'createdAt', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
        {
            IndexName: 'customer-index',
            KeySchema: [
                { AttributeName: 'customerId', KeyType: 'HASH' },
                { AttributeName: 'createdAt', KeyType: 'RANGE' }
            ],
            Projection: { ProjectionType: 'ALL' }
        },
        {
            IndexName: 'status-index',
            KeySchema: [
                { AttributeName: 'status', KeyType: 'HASH' },
                { AttributeName: 'createdAt', KeyType: 'RANGE' }
            ],
            Projection: { ProjectionType: 'ALL' }
        }
    ],
    BillingMode: 'PAY_PER_REQUEST'
};

export const INVOICE_TABLE_SCHEMA = {
    TableName: 'invoices',
    KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' },
        { AttributeName: 'customerId', AttributeType: 'S' },
        { AttributeName: 'status', AttributeType: 'S' },
        { AttributeName: 'createdAt', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
        {
            IndexName: 'customer-index',
            KeySchema: [
                { AttributeName: 'customerId', KeyType: 'HASH' },
                { AttributeName: 'createdAt', KeyType: 'RANGE' }
            ],
            Projection: { ProjectionType: 'ALL' }
        }
    ],
    BillingMode: 'PAY_PER_REQUEST'
};
