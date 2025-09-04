import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// import mongoose from 'mongoose';
// import helmet from 'helmet';
// import compression from 'compression';
// import rateLimit from 'express-rate-limit';
// import { fileURLToPath } from 'url';
// import { dirname, join } from 'path';
// import { redisHealthCheck } from './utils/redis.js';

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
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (corsOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

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
//  console.log("📩 OTP endpoint hit:", req.body);
  const { email ,code} = req.body;
  console.log("📩 HIT /send-otp route");

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  console.log(email);

  try {
//    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const transporter = nodemailer.createTransport({
      service: "gmail", // or custom SMTP
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS, // App password for Gmail
      },
      
    });
//    console.log(process.env.MAIL_USER,process.env.MAIL_PASS);

    await transporter.sendMail({
      from: `"SwapNest" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Your OTP Code - SwapNest",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>SwapNest Verification</h2>
          <p>Your one-time password (OTP) is:</p>
          <h1 style="color: #4F46E5; letter-spacing: 4px;">${code}</h1>
          <p>This code is valid for <b>10 minutes</b>.</p>
        </div>
      `,
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
