const mongoose = require('mongoose');
const validator= require(`validator`);

const userSchema= new mongoose.Schema({

   name:{
    type:String,
    required=[true, "Please enter a name"]},

   email:{
    type:String,
    required:[true,"Pleasw enter an email"],
    unique:[true],
    minlength: 8
},


   Photo:{
    type:String
   },

   password:{
   type: String,
   unique:true,
   required:[true,"Please enter a password"],
   validator:[validator.isEmail,"Provide a valid email"],
},
   passwordConfirm:{
    type: String,
    required:[true, "Please confirm your password."]
}

});

const User= mongoose.model('User', userSchema);

module.exports= User;