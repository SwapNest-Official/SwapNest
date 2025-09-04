import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// import mongoose from 'mongoose';
// import helmet from 'helmet';
// import compression from 'compression';
// import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
// import { redisHealthCheck } from './utils/redis.js';
import fs from 'fs';

// Import routes (commented out for now)
// import authRoutes from './routes/auth.js';
// import productRoutes from './routes/products.js';
// import orderRoutes from './routes/orders.js';
// import userRoutes from './routes/users.js';
// import emailRoutes from './routes/emails.js';

import nodemailer from 'nodemailer';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* ---------------- Path Setup ---------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/* ---------------- Security Middleware ---------------- */
// app.use(helmet());
// app.use(compression());

// Rate limiting (commented for now)
// const limiter = rateLimit({
//   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
//   max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
//   message: 'Too many requests from this IP, please try again later.'
// });
// app.use(limiter);

/* ---------------- CORS Setup ---------------- */
const corsOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://swapnest.in',
      'https://www.swapnest.in'
    ];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow curl / Postman with no origin
    if (corsOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Explicitly handle preflight requests
app.options('*', cors());

/* ---------------- Body Parsing ---------------- */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* ---------------- Static Files ---------------- */
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(import.meta.url);
// app.use('/uploads', express.static(join(__dirname, 'uploads')));

/* ---------------- Database (commented out for now) ---------------- */
// mongoose.connect(process.env.MONGODB_URI)
//   .then(() => {
//     console.log('✅ Connected to MongoDB successfully');
//   })
//   .catch((error) => {
//     console.error('❌ MongoDB connection error:', error);
//     process.exit(1);
//   });

/* ---------------- Routes (commented out for now) ---------------- */
// app.use('/api/auth', authRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/emails', emailRoutes);

/* ---------------- OTP Route ---------------- */
app.post('/send-otp', async (req, res) => {
  const { email, code } = req.body;
  console.log("📩 HIT /send-otp route");

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  try {
    // Read otpemail.html from templates folder
    let otpemail = fs.readFileSync(join(__dirname, 'templates', 'otpmail.html'), 'utf8');

    // Replace placeholder {{CODE}} in template with actual code
    otpemail = otpemail.replace('{{CODE}}', code);

    const transporter = nodemailer.createTransport({
      service: "gmail", // or custom SMTP
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS, // App password for Gmail
      },
    });

    await transporter.sendMail({
      from: `"SwapNest" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Your OTP Code - SwapNest",
      html: otpemail,
    });

    console.log(`✅ OTP sent to ${email}: ${code}`);

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("❌ Error sending OTP:", err);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

/* ---------------- Health Check (optional) ---------------- */
// app.get('/api/health', async (req, res) => {
//   try {
//     const redisStatus = await redisHealthCheck();
//     res.json({ 
//       status: 'OK',
//       message: 'SwapNest API is running',
//       timestamp: new Date().toISOString(),
//       redis: redisStatus ? 'Connected' : 'Disconnected',
//       environment: process.env.NODE_ENV,
//       cors: corsOrigins
//     });
//   } catch (error) {
//     res.status(500).json({ 
//       status: 'ERROR',
//       message: 'Health check failed',
//       error: error.message
//     });
//   }
// });

/* ---------------- Error Handling ---------------- */
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ 
//     error: 'Something went wrong!',
//     message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
//   });
// });

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

/* ---------------- Start Server ---------------- */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔒 CORS Origins: ${corsOrigins.join(', ')}`);
});
