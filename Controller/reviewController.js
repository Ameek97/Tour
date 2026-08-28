
const Review= require(`./../model/reveiwModel`)
const Tour= require('./../model/tourModel');
const AppError= require('./../appError');


const getReviewOwnerId= review=>{
  if(review.user && review.user._id){return review.user._id.toString();}
  return review.user.toString();
};

const isOwnerOrAdmin= (review, req)=>{
  return getReviewOwnerId(review)===req.user.id || req.user.role==='admin';
};


exports.postReview=async (req,res, next)=>{

try{
req.body = req.body || {};

const tourId= req.params.tourId || req.body.tour;

if(tourId){
  const tour= await Tour.findById(tourId);
  if(!tour){return next(new AppError('no document with such id was found',404));}
}

const review= await Review.create({
  review: req.body.review,
  rating: req.body.rating,
  user: req.user.id,
  tour: tourId
});

res.status(200)
   .json({
    status:"sucess",
    review
   })

} catch(err){return next(err);}  
}



exports.getReviews= async (req,res,next)=>{
    try{

   let filter={};
   if(req.params.tourId){filter={tour:req.params.tourId}}
   const reviews= await Review.find(filter);
    
   res.status(200)
   .json({
    status:"sucess",
    result:reviews.length,
    reviews
   })

    } catch(err){return next(err);}


};

exports.getReview= async (req,res,next)=>{
  try{
    const review= await Review.findById(req.params.id);

    if(!review){return next(new AppError('no document with such id was found',404));}

    res.status(200)
       .json({
         status:"sucess",
         review
       });
  } catch(err){return next(err);}
};

exports.updateReview= async (req,res,next)=>{
  try{
    const existing= await Review.findById(req.params.id);

    if(!existing){return next(new AppError('no document with such id was found',404));}

    if(!isOwnerOrAdmin(existing, req)){
      return next(new AppError("You are not authorised to this.",403));
    }

    const update={};
    if(req.body.review !== undefined){update.review=req.body.review;}
    if(req.body.rating !== undefined){update.rating=req.body.rating;}

    const review= await Review.findByIdAndUpdate(req.params.id, update, {
      new:true,
      runValidators:true
    });

    res.status(200)
       .json({
         status:"sucess",
         review
       });
  } catch(err){return next(err);}
};

exports.deleteReview= async (req,res,next)=>{
  try{
    const review= await Review.findById(req.params.id);

    if(!review){return next(new AppError('no document with such id was found',404));}

    if(!isOwnerOrAdmin(review, req)){
      return next(new AppError("You are not authorised to this.",403));
    }

    await Review.findByIdAndDelete(req.params.id);

    res
      .status(200)
      .json({
        status:`Success`,
        message:`record succesfully deleted`
      });
  } catch(err){return next(err);}
};
