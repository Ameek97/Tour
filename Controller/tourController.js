const Tour= require('../model/tourModel.js');
const APIfeatures= require(`./../Utils/APIfeatures`);
const handlerFactory=require('./handlerFactory');
const AppError= require('../appError');

exports.getAllTours= async(req,res,next)=>{
try{

   const query=Tour.find();
   
   const features= new APIfeatures(query,req.query);
   features
          .filter()
          .sort()                                             
          .limitFields()
          .paginate();

   const tours = await features.query;
   
    res
    .status(200)
    .json({
        status:"success",
        result:tours.length,
        data:{tours} 
          })
 }catch(err){ 
      next(err);
    }
}



exports.postTour= async (req,res,next)=>{
try{
const newTour= await Tour.create(req.body);
res
  .status(200)
  .json({
    Status:"Success",
    Data:{
        Tour:newTour
         }
  });
}
catch(err){
  next(err); }
}

exports.tourByID= async (req,res,next)=>{
   try{
    const tour= await Tour.findById(req.params.id).populate('reviews');
    if(!tour){
      return next(new AppError('no document with such id was found',404));
    }
    res
    .status(200)
    .json({
        status:"success",
        result:tour.length,
        data:{tour} 
          })
          
     }catch(err){ 
        next(err);
    }
}

exports.updateTour= async (req,res,next)=>{
  try{
    if(req.body && req.body._id){delete req.body._id;}

    const tour= await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new:true,
      runValidators:true
    });

    if(!tour){
      return next(new AppError('no document with such id was found',404));
    }

    res
    .status(200)
    .json({
        status:"success",
        data:{tour}
    });
  } catch(err){
    next(err);
  }
}
/* -----------------------------------------------------------------*/
exports.deleteTour=handlerFactory.deleteOne(Tour); // this fn immidiately return async (req,res,next)

/* 
exports.deleteTour=async (req,res)=>{      
try{
await Tour.findByIdAndDelete(req.params.id)
res
   .status(200)
   .json({
    status:`Success`,
    message:`record succesfully deleted`
   })
} catch(err){
     next(err);
}}
*/

exports.deleteAllTours=async (req,res,next)=>{
  
await Tour.deleteMany({});
 return res.status(200).json({
      status:"success"});

}





