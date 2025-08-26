/**
 * SonGo Payment Service - Secure payment processing for shipping
 * Supports credit cards, debit cards, and digital wallets
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { config } from './config/config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { authMiddleware } from './middleware/auth';

// Route imports
import paymentRoutes from './routes/payment.routes';
import invoiceRoutes from './routes/invoice.routes';
import webhookRoutes from './routes/webhook.routes';
import healthRoutes from './routes/health.routes';

// Service imports
import { PaymentService } from './services/payment.service';
import { StripeService } from './services/stripe.service';
import { PayPalService } from './services/paypal.service';
import { DynamoDBService } from './services/dynamodb.service';
import { NotificationService } from './services/notification.service';

class PaymentServiceApp {
    private app: express.Application;
    private server: any;

    constructor() {
        this.app = express();
        this.initializeMiddleware();
        this.initializeRoutes();
        this.initializeErrorHandling();
        this.initializeServices();
    }

    private initializeMiddleware(): void {
        // Security middleware
        this.app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                },
            },
        }));

        // CORS configuration
        this.app.use(cors({
            origin: config.ALLOWED_ORIGINS,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        }));

        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // limit each IP to 100 requests per windowMs
            message: 'Too many requests from this IP, please try again later.',
            standardHeaders: true,
            legacyHeaders: false,
        });
        this.app.use('/api/', limiter);

        // Stripe webhook rate limiting (more restrictive)
        const webhookLimiter = rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 50,
            message: 'Too many webhook requests, please try again later.',
        });
        this.app.use('/api/webhooks/', webhookLimiter);

        // Body parsing
        this.app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Compression
        this.app.use(compression());

        // Request logging
        this.app.use(requestLogger);
    }

    private initializeRoutes(): void {
        // Health check routes (no auth required)
        this.app.use('/health', healthRoutes);
        this.app.use('/api/health', healthRoutes);

        // Webhook routes (no auth required, but signature verification)
        this.app.use('/api/webhooks', webhookRoutes);

        // Protected routes
        this.app.use('/api/payments', authMiddleware, paymentRoutes);
        this.app.use('/api/invoices', authMiddleware, invoiceRoutes);

        // Root endpoint
        this.app.get('/', (req, res) => {
            res.json({
                service: 'SonGo Payment Service',
                version: '2.0.0',
                status: 'healthy',
                features: [
                    'Credit/Debit Card Processing',
                    'PayPal Integration',
                    'Automated Invoicing',
                    'Refund Management',
                    'Payment Analytics',
                    'PCI Compliance'
                ],
                endpoints: {
                    payments: '/api/payments',
                    invoices: '/api/invoices',
                    webhooks: '/api/webhooks',
                    health: '/health'
                }
            });
        });

        // 404 handler
        this.app.use('*', (req, res) => {
            res.status(404).json({
                error: 'Endpoint not found',
                message: `Cannot ${req.method} ${req.originalUrl}`,
                availableEndpoints: [
                    '/api/payments',
                    '/api/invoices',
                    '/api/webhooks',
                    '/health'
                ]
            });
        });
    }

    private initializeErrorHandling(): void {
        this.app.use(errorHandler);
    }

    private async initializeServices(): Promise<void> {
        try {
            logger.info('Initializing payment services...');

            // Initialize DynamoDB
            const dynamoService = new DynamoDBService();
            await dynamoService.initialize();

            // Initialize payment providers
            const stripeService = new StripeService();
            const paypalService = new PayPalService();

            // Initialize notification service
            const notificationService = new NotificationService();

            // Initialize main payment service
            const paymentService = new PaymentService(
                stripeService,
                paypalService,
                dynamoService,
                notificationService
            );

            // Make services available to routes
            this.app.locals.paymentService = paymentService;
            this.app.locals.stripeService = stripeService;
            this.app.locals.paypalService = paypalService;
            this.app.locals.dynamoService = dynamoService;
            this.app.locals.notificationService = notificationService;

            logger.info('Payment services initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize payment services:', error);
            process.exit(1);
        }
    }

    public async start(): Promise<void> {
        const port = config.PORT || 8082;
        
        this.server = createServer(this.app);
        
        this.server.listen(port, () => {
            logger.info(`🚀 Payment Service started on port ${port}`);
            logger.info(`📊 Environment: ${config.NODE_ENV}`);
            logger.info(`🔒 Security: Helmet enabled`);
            logger.info(`💳 Stripe: ${config.STRIPE_SECRET_KEY ? 'Configured' : 'Not configured'}`);
            logger.info(`💰 PayPal: ${config.PAYPAL_CLIENT_ID ? 'Configured' : 'Not configured'}`);
        });

        // Graceful shutdown
        process.on('SIGTERM', () => this.shutdown());
        process.on('SIGINT', () => this.shutdown());
    }

    private async shutdown(): Promise<void> {
        logger.info('Shutting down Payment Service...');
        
        if (this.server) {
            this.server.close(() => {
                logger.info('Payment Service shut down successfully');
                process.exit(0);
            });
        }
    }

    public getApp(): express.Application {
        return this.app;
    }
}

// Create and start the application
const paymentApp = new PaymentServiceApp();

if (require.main === module) {
    paymentApp.start().catch((error) => {
        logger.error('Failed to start Payment Service:', error);
        process.exit(1);
    });
}

export default paymentApp;
