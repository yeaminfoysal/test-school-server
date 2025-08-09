import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { connectDB } from './server';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;


connectDB();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5174',
  credentials: true,
}));


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


app.use(compression());


app.use(morgan('combined'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to Test School db"
  })
})

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);

  // Seed initial data in development
  if (process.env.NODE_ENV !== 'production') {
    try {
      console.log('✅ Initial data seeded successfully');
    } catch (error) {
      console.error('❌ Error seeding data:', error);
    }
  }
});

export default app;