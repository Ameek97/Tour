const User = require('../model/userModel');
const jwt= require(`jsonwebtoken`);
const AppError = require('./../appError');

const createToken = id=>{
    return jwt.sign({ id },
        "this-is-a-very-secure-key",
        { expiresIn: "5d" })
}


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


exports.login=async (req,res,next)=>{

try{

 const {email,password}= req.body;

 
 // 1) check if the email and password were entered 
 if(!email || !password){
   return next(new AppError("please provide  Email and password",400));}

// 2) checking that email exists and its corresponding password matches 
const user = await User.findOne({email}).select("+password");

   // if either is an issue than throw an error
if(!user || !(await user.correctPassword(password, user.password))){ 
   return next(new AppError(`Incorrect email or password`,401));}

  const token = createToken(user._id);
  res  
     .status(200)
     .json({token})

}

catch(err){next(err);}

}