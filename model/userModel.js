const mongoose = require('mongoose');
const validator= require(`validator`);
const bcrypt= require(`bcryptjs`);


const userSchema = new mongoose.Schema({
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

    passwordChangedAt: Date
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

// schema method doesent use the arrow fucntion
userSchema.methods.correctPassword= async function(p1,p2){
   console.log(p1);
   console.log(p2);
   return bcrypt.compare(p1,p2);
};


userSchema.methods.changedPasswordAfter= function(iat){

 if(this.passwordChangedAt){
  const changedTimeStamp= parseInt(this.passwordChangedAt.getTime()/1000,10);

    return changedTimeStamp > iat;
 }
  return false;
}


const User = mongoose.model('User', userSchema);
module.exports = User;