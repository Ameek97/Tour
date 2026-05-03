const mongoose = require('mongoose');
const User= require(`.//userModel`);

const DB = process.env.DATABASE.replace('<db_password>', process.env.PASSWORD);


mongoose.connect(DB)
    .then(() => {
        console.log('Connection to MongoDB successful ✅');
    })
    .catch(err => {
        console.error('Connection error:', err.message);
    });

const tourSchema= new mongoose.Schema({
    name:{
        type:String,
        unique:[true,`A tour must have a name`],
        require:true,
        },
    
        price:{
            type:Number,
            require:[true,`A tour must a price`],
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
      reuired:[true,`an tour must have an image cover`]
    },

    images:{
        type:[String],
    },

    createdAt:{
        type:Date,
        deafult:Date.now
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

tourSchema.virtual(`virtualField`).get(function(){
    return `this is veirtual field`;
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

// tourSchema.post('save', function(doc){
//     console.log('POST');
// });

tourSchema.virtual(`save`,function(doc,next){
    console.log("saved");

})

// query middlewear
tourSchema.pre(`find`,function(){
    //  this.sort(`price`);
});



const Tour=mongoose.model('Tour',tourSchema);



module.exports=Tour;     