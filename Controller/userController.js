const User = require('./../model/userModel');

exports.signup= async (req,res,next)=>{

    try{
     const newUser = await User.create(req.body);
     res.status(201).json({
                           status:"success",
                           user:newUser
                          });
   }
  catch(err){next(err);}
}