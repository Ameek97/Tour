
const Review= require(`./../model/reveiwModel`)

exports.postReview=async (req,res, next)=>{

try{
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

   const reviews= await Review.find({});
    
   res.status(200)
   .json({
    status:"sucess",
    review
   })

    } catch(err){return next(err);}


}