const express = require('express');
const dotenv = require('dotenv');
const dns = require('dns'); 
const appError= require('./appError');
const errorControl= require("./ErrorController");

dotenv.config({ path: './config.env' });
dns.setServers(["1.1.1.1","8.8.8.8"]);
const port=3000;


const tourRouter=require(`./Routes/tourRoutes`);
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('query parser', 'extended'); 

app.use("/api/tour",tourRouter);




app.all('*', (req,res,next)=>{
      next(new appError("Not a valid route",404));
});

app.use(errorControl);

app.listen(port,()=>{
    console.log(`app running on port ${port}`);
    
});

