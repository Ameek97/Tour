const User = require('../model/userModel');
const jwt= require(`jsonwebtoken`);
const AppError = require('./../appError');
const {promisify}= require('util');


const createToken = id=>{
    return jwt.sign({ id },
        process.env.JWT_KEY,
        { expiresIn: process.env.JWT_EXP,
          
         })
}


exports.signup= async (req,res,next)=>{

    try{
     const newUser = await User.create(req.body);

     const token = jwt.sign(

        { id: newUser._id },
        process.env.JWT_KEY,
        { expiresIn: process.env.JWT_EXP,
          
         }
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
 const decoded=await promisify(jwt.verify)(token,process.env.JWT_KEY);

 console.log(decoded);

 // 3) check if the user still exists

   const newUser= await User.findById(decoded.id);

   if(!newUser){return next(new AppError("The user this token belongs to no longer exists.",401));}


 // 4) check if the password was changed after the token was issued

  // model instance function 
  if(newUser.changedPasswordAfter(decoded.iat)){
   return next(new AppError("The password was changed after the token was issued, please login again.",401));}

req.user=newUser; // just the token may have been provided, req.user could have been nothing 

// if next was reached means that token was authorised
next();

}

// Authorisation function based on role in schema, 
// if the role is not allowed than an error is sent and next() is not reached

/* you cant add argument to a middlewear fucntion, 
  so we do this instead.
  note- (req,res,next) arent considered as as arguments here,  */

exports.restrictTo= (...roles)=>{//here roles is an array of arguments that we passed 
  return (req,res,next)=>{

   // here req.user we created in private fucntion above this 
   if(!roles.includes(req.user.role)){return next(new AppError("You are not authorised to this.",403));}

    // you have authority
    next();
  }
};