const express = require('express');
const dotenv = require('dotenv');
const dns = require('dns'); 
const appError= require('./appError');
const errorControl= require("./ErrorController");
const rateLimit= require('express-rate-limit');


dotenv.config({ path: './config.env' });
dns.setServers(["1.1.1.1","8.8.8.8"]);
const port=3000;


const tourRouter=require(`./Routes/tourRoutes`);
const userRouter = require('./Routes/userRoutes');

const app = express();

// global midlewears
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('query parser', 'extended'); 

// setting rate limit

const limiter= rateLimit({
  // how many reqs allowed
  max: 100,
  // in how much time (in millisecond)
  windowMs: 60*60*1000,
  message:"Too many requests from this IP, try again in an hour."
});

// specify this limiter is to be used for what api
app.use('/api', limiter);

// route middlewear
app.use("/api/tour",tourRouter);
app.use(`/api/user`,userRouter);



app.use((req, res, next) => {
  next(new appError("Not a valid route", 404));
});

app.use(errorControl);

app.listen(port,()=>{
    console.log(`app running on port ${port} ✅`);
    
    
});

