const User = require('../model/userModel');
const jwt= require(`jsonwebtoken`);
const AppError = require('./../appError');
const {promisify}= require('util');
const sendMail= require(`./../sendEmail`);
const crypto= require('crypto');
const { isProduction } = require('../Utils/env');


const createToken = id=>{
    return jwt.sign({ id },
        process.env.JWT_KEY,
        { expiresIn: process.env.JWT_EXP || '90d',
          
         })
}

const cookieOptions = () => {
  const days = Number(process.env.COOKIE_EXP);
  const expireDays = Number.isFinite(days) && days > 0 ? days : 90;
  const options = {
    expires: new Date(Date.now() + expireDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: 'lax',
    path: '/'
  };

  if (isProduction()) {
    options.secure = true;
    if (process.env.FRONTEND_ORIGIN) {
      options.sameSite = 'none';
    }
  }

  return options;
};

const createSendToken = (user, statusCode, res) => {
  const token = createToken(user._id);
  res.cookie('jwt', token, cookieOptions());

  res.status(statusCode).json({
    status: 'success'
  });
};


exports.signup= async (req,res,next)=>{

    try{
     const newUser = await User.create({
        name: req.body && req.body.name,
        email: req.body && req.body.email,
        password: req.body && req.body.password,
        passwordConfirm: req.body && req.body.passwordConfirm,
        role: 'user'
     });

     createSendToken(newUser,201,res);
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

  createSendToken(user,201,res);

}

catch(err){next(err);}

}


exports.protect= async (req,res, next)=>{
try{
let token; 

if(req.headers.authorization  && req.headers.authorization.startsWith("Bearer")){
  token = req.headers.authorization.split(' ')[1];
} else if(req.headers.cookie){
  const jwtCookie= req.headers.cookie.split(';').map(part=>part.trim()).find(part=>part.startsWith('jwt='));
  if(jwtCookie){
    token= decodeURIComponent(jwtCookie.slice(4));
  }
}

if(!token || token==='loggedout'){return next(new AppError("Request denied you were not logged in",401));}

 const decoded=await promisify(jwt.verify)(token,process.env.JWT_KEY);

   const newUser= await User.findById(decoded.id);

   if(!newUser){return next(new AppError("The user this token belongs to no longer exists.",401));}

  if(newUser.changedPasswordAfter(decoded.iat)){
   return next(new AppError("The password was changed after the token was issued, please login again.",401));}

req.user=newUser;
next();
} catch(err){
  return next(err);
}
};

exports.logout= (req,res)=>{
  const options = cookieOptions();
  options.expires = new Date(Date.now() + 10 * 1000);
  res.cookie('jwt', 'loggedout', options);

  res.status(200).json({
    status:'success'
  });
};

exports.getMe= (req,res)=>{
  const user= req.user;

  res.status(200).json({
    status:'success',
    data:{
      user:{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        photo: user.photo
      }
    }
  });
};

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

try{
exports.forgotPassword= async (req,res, next)=>{

 try{ 
if(!req.body || !req.body.email){return next(new AppError("provide an email",400));}

const user= await User.findOne({email:req.body.email});
const generic = {
  status: 'success',
  message: 'If that email exists, a reset message has been sent.'
};

if(!user){
  return res.status(200).json(generic);
}

const resetToken= user.createPasswordResetToken();
 await user.save({validateBeforeSave:false});

  const url=`${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

 const message= `Want to reset your password? Click on the link ${url} to reset, else 
  ignore this email.`;
 
 const subject="Reset password"; 

try{

await sendMail({
          email:user.email,
          subject,
          message});

 res.status(200).json(generic);
} catch(err){

  user.passwordResetToken=undefined;
  user.passwordTokenExpire=undefined;
  await user.save({validateBeforeSave:false});
  console.error('Reset email failed');
  return res.status(200).json(generic);
}


}

catch(err){return next(err);}
}   
} catch(err){return next(err);}


exports.resetPassword=async(req,res,next) =>{

try{  
// 1) look for the user with this token

const hashtoken=  crypto
                  .createHash(`sha256`)
                  .update(req.params.token)
                  .digest(`hex`);

 const user= await User.findOne({
        passwordResetToken: hashtoken,
        passwordTokenExpire:{$gt:Date.now()} 
 });
if(!user){return next(new AppError("invalid or expired token",400)); }

//2) set the new password

// the password will be saved in the pre save middlewear

if(!req.body.password){return next(new AppError("please provide a password",400));}


user.password=req.body.password;
user.passwordConfirm=req.body.passwordConfirm;
user.passwordResetToken=undefined;
user.passwordTokenExpire=undefined;

await user.save();

//3) update the password changedAt -> do this in pre save middlewear of model


// 3) login the user in, send the jwt 

  createSendToken(user,201,res);
  
   } catch(err){return next(err);}
  

};

exports.updatePassword=async (req, res, next)=>{

  try{

  // get the user, req.user comes after protect function 
  const user = await User.findById(req.user.id).select("+password");
 
  if(!user){return next(new AppError("No user with such email exists",404));}

  if(!(await user.correctPassword(req.body.passwordCurrent, user.password))){
        return next(new AppError("Your password is incorrect", 401));}
        
   user.password= req.body.password;     
   user.passwordConfirm= req.body.passwordConfirm;     
   await user.save();
   
   createSendToken(user, 200, res);
   } catch(err){return next(err);}

}