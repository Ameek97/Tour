const mongoose = require('mongoose');
require('../Utils/loadEnv');
const User= require(`.//userModel`);
const { isProduction } = require('../Utils/env');

if (!process.env.DATABASE) {
  console.error('DATABASE environment variable is not set');
  process.exit(1);
}

const DB = process.env.DATABASE.replace('<db_password>', process.env.PASSWORD || '');

mongoose.connect(DB)
    .then(() => {
        console.log('Connection to MongoDB successful ✅');
    })
    .catch(() => {
        console.error('MongoDB connection failed');
        if (!isProduction()) {
          console.error('Check DATABASE and PASSWORD environment variables.');
        }
        process.exit(1);
    });

const tourSchema= new mongoose.Schema({
    name:{
        type:String,
        unique:[true,`A tour must have a name`],
        required:true,
        },
    
        price:{
            type:Number,
            required:[true,`A tour must a price`],
        },

    rating:{
        type:Number,
        default:4.5,
    },    

    ratingAverage:{
        type:Number,
        default:4.5
    },

    summary:{
        type:String,
         required:[true,`a tour must have a summary`],
        trim:true
    },

    imageCover:{
      type:String,
      required:[true,`an tour must have an image cover`]
    },

    images:{
        type:[String],
    },

    createdAt:{
        type:Date,
        default:Date.now
    },

 startLocation: {
  type: {
    type: String,
    default: 'Point',
    enum: ['Point']}
    ,
  coordinates: [Number],   // [lng, lat]
  address: String,
  description: String
},

// array of embedded documents
locations: [
  {
    //enables GEOjson
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number],
    address: String,
    description: String
  }
],

    // embedded    
    guides:[{
        type :mongoose.Schema.ObjectId,
        ref:`User`,
    }],


    


    startDates:[Date],} , {
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});

tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual(`virtualField`).get(function(){
    return `this is veirtual field`;
});

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

// ***** query middleware *****

// populate the child referenced docs
tourSchema.pre(/^find/, function(){
     this.populate({
        path:'guides',
        select:"-__v -passwordChangedAt"
     });
})


// ***** document middleware *****

// tourSchema.pre(`save`,async function(){

// const guidePromises = this.guides.map(el => User.findById(el));
// this.guides = await Promise.all(guidePromises);
// })

// tourSchema.pre('save', function(next){
//     console.log('PRE');
    
// });

// query middlewear
tourSchema.pre(`find`,function(){
    //  this.sort(`price`);
});



const Tour=mongoose.model('Tour',tourSchema);



module.exports=Tour;     