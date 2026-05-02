const AppError = require('../appError');
const User = require('./../model/userModel');
const jwt= require(`jsonwebtoken`);


const updateObj=(obj, ...allowedField)=>{

}

exports.getAllUsers=async (req,res,next)=>{

  try{
   const users= await User.find();
   
    res. status(200).json({
        status:"Success",
        result:users.length,
        user:users
    });

  } catch(err){return next(err);}

} 

exports.deleteMe=async (req,res,next)=>{
  try{
    await User.findByIdAndUpdate(req.user.id, {active:false});
    res.status(200)
       .json({status:"succesful",
              message: "user deleted"});
  
    res} catch(err){return next(err);}
}


exports.updadteMe = async (req,res,next)=>{

 // check if the client has provided with password
 if(user.req.password || user.req.passwordConfirm){
  return next(new AppError("This to not the correct route for updating the password. For updating the password, use the route  /updatePassword"));
 }
 
 // filter out the params sent by the user, so user may not change role or other params
 const userData = filterObj(req.body,"name", "email");

const updatedUser = await User.findOneAndUpdate(req.user.id, userData,{
  new:true,
  runValidators:true
});

 res 
    .status(200)
    .json({
      status:"sucess",
      Updated_user: updatedUser
    });

}