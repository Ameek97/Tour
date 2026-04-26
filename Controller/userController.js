const User = require('./../model/userModel');
const jwt= require(`jsonwebtoken`);

exports.getAllUsers=async (req,res,next)=>{

  try{
   const users= await User.find();
   
    res. status(200).json({
        status:"Success",
        user:users
    });

  } catch(err){return next(err);}

} 