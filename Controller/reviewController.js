
const Review= require(`./../model/reveiwModel`)
const handlerFactory=require('./handlerFactory');


exports.postReview=async (req,res, next)=>{

try{
req.body = req.body || {};
if(!req.body.tour){req.body.tour=req.params.id;}
if(!req.body.user){req.body.user=req.user.id;}

const review= await Review.create(req.body);

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
   if(req.params.tour){filter={tour:req.params.tour}} // tour contains parent(tour id) it refers to      
   const reviews= await Review.find(filter);
    
   res.status(200)
   .json({
    status:"sucess",
    result:reviews.length,
    reviews
   })

    } catch(err){return next(err);}


};

exports.deleteReview= handlerFactory.deleteOne(Review);