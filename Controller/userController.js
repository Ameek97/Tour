const User = require('./../model/userModel');
const jwt= require(`jsonwebtoken`);


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
  } catch(err){return next(err);}
}