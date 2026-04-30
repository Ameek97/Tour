const mongoose = require('mongoose');
const validator= require(`validator`);
const bcrypt= require(`bcryptjs`);
const crypto = require(`crypto`);

const userSchema = new mongoose.Schema({

    role:{
      type:String,
      enum:[`user`, `admin`, `guide`, `lead guide`],
      default:"user"
    },

    name: {
        type: String,
        required: [true, 'Please enter a name']
    },
    email: {
        type: String,
        required: [true, 'Please enter an email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: {
        type: String
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate:{
         validator:function(el){
            return el==this.password;
         },
         message:"The confirmed password does not match"
         }
    },

    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordTokenExpire: Date
}, 

);

// mongoose middlewear schema doesent use any next() fucntion now
// works only for create or save
userSchema.pre('save', async function() {
    if (!this.isModified('password')){return };
    
    // hashing the password 
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    
    
});


// update the password modify time if password was changed
userSchema.pre('save', function () {
  if (!this.isModified('password') || this.isNew) {return;}
  this.passwordChangedAt = Date.now() - 1;
});


// schema method doesent use the arrow fucntion
userSchema.methods.correctPassword= async function(p1,p2){

   return bcrypt.compare(p1,p2);
};


userSchema.methods.changedPasswordAfter= function(iat){

 if(this.passwordChangedAt){
  const changedTimeStamp= parseInt(this.passwordChangedAt.getTime()/1000,10);

    return changedTimeStamp > iat;
 }
  return false;
}


userSchema.methods.createPasswordResetToken=function(){

    // creates a random reset token to be sent to user
    const resetToken= crypto.randomBytes(32).toString("hex");

    // creates an encrypted version of the reset token to be stored in the db,
    // we store this so we can compare during password reset 
    this.passwordResetToken= crypto
                                   .createHash(`sha256`)
                                   .update(resetToken)
                                   .digest(`hex`);
    this.passwordTokenExpire= Date.now() + 10*60*1000; 
   return resetToken; 
}


const User = mongoose.model('User', userSchema);
module.exports = User;