const fs = require("fs");
const dotenv = require('dotenv');
const dns = require('dns');
dns.setServers(["1.1.1.1","8.8.8.8"]);

dotenv.config({ path: "./../../config.env" });
const Tour=require(`./../../model/tourModel`);
const mongoose =require("mongoose");

const DB = process.env.DATABASE.replace('<db_password>', process.env.PASSWORD);

mongoose.connect(DB)
    .then(() => {
        console.log('Connection to MongoDB successful');
    })
    .catch(err => {
        console.error('Connection error:', err.message);
    });


// const tour= fs.readFileSync({});
// const importData=async ()=>{
// try{
//    await Tour.create(tours);
//    console.log("data added succesfully");
// } catch(err){
//     console.log(err);
       
//     }
// }

const deleteAll= async()=>{
try{
   await Tour.deleteMany({}); 
   console.log("Data deletion succesfull");
   process.exit();
} catch(err){
    console.log(err);
   }
}  

deleteAll();


