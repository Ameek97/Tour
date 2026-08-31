const express = require('express');
const path = require('path');
const fs = require('fs');
const dns = require('dns');
const rateLimit = require('express-rate-limit');

require('./Utils/loadEnv');

const appError = require('./appError');
const errorControl = require('./ErrorController');
const { isProduction } = require('./Utils/env');
const tourRouter = require('./Routes/tourRoutes');
const userRouter = require('./Routes/userRoutes');
const reviewRouter = require('./Routes/reviewRoutes');
const bookingRouter = require('./Routes/bookingRoutes');
const bookingController = require('./Controller/bookingController');

dns.setServers(['1.1.1.1', '8.8.8.8']);

const port = Number(process.env.PORT) || 3000;
const frontendDist = path.join(__dirname, 'frontend', 'dist');
const frontendIndex = path.join(frontendDist, 'index.html');

function allowedOrigins() {
  return String(process.env.FRONTEND_ORIGIN || '')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean);
}

if (isProduction()) {
  const missing = ['JWT_KEY', 'DATABASE'].filter(name => !process.env[name]);
  if (missing.length) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

const app = express();

if (isProduction()) {
  app.set('trust proxy', 1);
}

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowed = allowedOrigins();
  if (origin && allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    res.setHeader('Vary', 'Origin');
  }
  if (req.method === 'OPTIONS' && origin && allowed.includes(origin)) {
    return res.status(204).end();
  }
  next();
});

app.use(express.urlencoded({ extended: true, limit: '100kb' }));

app.post(
  '/api/booking/webhook',
  express.raw({ type: 'application/json', limit: '100kb' }),
  bookingController.handleWebhook
);

app.use(express.json({ limit: '100kb' }));
app.set('query parser', 'extended');

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

if (isProduction()) {
  const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, try again in an hour.'
  });
  app.use('/api', limiter);

  const authLimiter = rateLimit({
    max: 20,
    windowMs: 15 * 60 * 1000,
    message: 'Too many authentication attempts, try again later.'
  });
  app.use('/api/user/login', authLimiter);
  app.use('/api/user/signup', authLimiter);
  app.use('/api/user/forgotPassword', authLimiter);
}

app.use('/api/tour', tourRouter);
app.use('/api/user', userRouter);
app.use('/api/review', reviewRouter);
app.use('/api/booking', bookingRouter);

if (isProduction() && fs.existsSync(frontendIndex)) {
  app.use(express.static(frontendDist));
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return next();
    }
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(frontendIndex);
  });
}

app.use((req, res, next) => {
  next(new appError('Not a valid route', 404));
});

app.use(errorControl);

app.listen(port, () => {
  console.log(`app running on port ${port} ✅`);
});
