const User = require('../model/userModel');
const jwt= require(`jsonwebtoken`);
const AppError = require('./../appError');
const {promisify}= require('util');

const createToken = id=>{
    return jwt.sign({ id },
        "this-is-a-very-secure-key",
        { expiresIn: "5d",
          iat:Date
         })
}


exports.signup= async (req,res,next)=>{

    try{
     const newUser = await User.create(req.body);

   

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


exports.protect= async (req,res, next)=>{

// 1)check if the token was sent
let token; 

if(req.headers.authorization  && req.headers.authorization.startsWith("Bearer")){
  token = req.headers.authorization.split(' ')[1];
}

// if no token was sent
if(!token){return next(new AppError("Request denied you were not logged in",401));}


// 2) verify the token

 // verifies the token and as we promisify, it returns the token json
 const newUser=await promisify(jwt.verify)(token,process.env.JWT_KEY);


next();

}