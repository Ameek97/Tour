const express = require('express');
const dotenv = require('dotenv');
const dns = require('dns');
dotenv.config({ path: './config.env' });
dns.setServers(["1.1.1.1","8.8.8.8"]);
const port=3000;


const tourRouter=require(`./Routes/tourRoutes`);
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('query parser', 'extended'); 

app.use("/api/tour",tourRouter);

app.listen(port,()=>{
    console.log(`app running on port ${port}`);
})

