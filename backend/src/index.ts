import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import topicRoutes from './routes/topicRoutes';
import practiceRoutes from './routes/practiceRoutes';
import progressRoutes from './routes/progressRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const isProd = process.env.NODE_ENV === 'production';

// Enable trust proxy for Vercel and reverse proxies
app.set('trust proxy', 1);

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests from same origin, client URL, or without origin (server-to-server/curl)
      callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Secure Session Configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'quick-maths-dev-secret-key-39120912',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  })
);

// Rate Limiter for Authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' },
});

// API Router
const apiRouter = express.Router();

// Health check endpoint
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Quick Maths API',
    database: 'MySQL',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes on apiRouter
apiRouter.use('/auth', authLimiter, authRoutes);
apiRouter.use('/topics', topicRoutes);
apiRouter.use('/practice', practiceRoutes);
apiRouter.use('/progress', progressRoutes);

// Mount under both /api and root / to support direct routing or stripped path prefixes
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Application Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: isProd ? 'An unexpected error occurred.' : err.message,
  });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Quick Maths API Server running on http://localhost:${PORT}`);
    console.log(`📡 Connected to MySQL database via Prisma`);
  });
}

export default app;
