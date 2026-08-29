const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const dns = require('dns'); 
const appError= require('./appError');
const errorControl= require("./ErrorController");
const rateLimit= require('express-rate-limit');


dotenv.config({ path: path.join(__dirname, 'config.env') });
dns.setServers(["1.1.1.1","8.8.8.8"]);
const port=process.env.PORT;


const tourRouter=require(`./Routes/tourRoutes`);
const userRouter = require('./Routes/userRoutes');
const reviewRouter = require(`./Routes/reviewRoutes`);
const bookingRouter = require('./Routes/bookingRoutes');
const app = express();

// global midlewears
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('query parser', 'extended'); 

// Rate limiting is for production only. Local development must not
// return 429 during repeated testing.
const isProduction = String(process.env.NODE_ENV || '').trim() === 'production';
if (isProduction) {
  const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, try again in an hour.'
  });
  app.use('/api', limiter);
}

// route middlewear
app.use("/api/tour",tourRouter);
app.use(`/api/user`,userRouter);
app.use('/api/review',reviewRouter);
app.use('/api/booking',bookingRouter);


app.use((req, res, next) => {
  next(new appError("Not a valid route", 404));
});

app.use(errorControl);

app.listen(port,()=>{
    console.log(`app running on port ${port} ✅`);
    
    
});
