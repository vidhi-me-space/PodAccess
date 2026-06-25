import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { fileURLToPath } from 'url';
import path from 'path';
import connectDB from './config/db.js';
import podcastRoutes from './routes/podcastRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
console.log("ENV URI:", process.env.MONGODB_URI);

// GLOBAL HACK: Ignore SSL certificate errors (needed for 2026 system clock)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();
const PORT = process.env.PORT || 5000;

// Allow multiple origins (Web dev + Capacitor Android/iOS)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost',
  'capacitor://localhost'
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'PodAccess API' });
});

app.use('/api', podcastRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Catch-all Error Handler
app.use((err, _req, res, _next) => {
  console.error('❌ SERVER ERROR:', err.message);

  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'File too large. Maximum size is 25MB.'
        : err.message;
    return res.status(400).json({ error: message });
  }

  if (err.message?.includes('Only MP3, WAV, and M4A files are allowed')) {
    return res.status(400).json({ error: err.message });
  }

  if (err.name === 'CastError' || err.name === 'BSONError') {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 [LOCAL] PodAccess API running on http://localhost:${PORT}`);
  console.log("👉 CURRENT TIME:", new Date().toLocaleTimeString());
});



