const User = require('../model/userModel');
const jwt= require(`jsonwebtoken`);

exports.signup= async (req,res,next)=>{

    try{
     const newUser = await User.create(req.body);

     console.log(process.env.JWT_KEY);
     console.log(process.env.NODE_ENV);

     const token = jwt.sign(

        { id: newUser._id },
        "this-is-a-very-secure-key",
        { expiresIn: "5d" }
     );


     res.status(201).json({
                           token:token,
                           status:"success",
                           user:newUser
                          });
   }
  catch(err){next(err);}
}