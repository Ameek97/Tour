const Tour= require('./../model/tourModel');
const APIfeatures= require(`./../Utils/APIfeatures`);
 

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
    // TODO: implement get tour by ID
    res.status(200).json({
      status: 'success',
      data: { tour: 'placeholder' }
    });
  } catch(err){
    next(err);
  }
}

exports.deleteTour= async (req,res,next)=>{
  try{
    // TODO: implement delete tour
    res.status(200).json({
      status: 'success',
      message: 'Tour deleted (placeholder)'
    });
  } catch(err){
    next(err);
  }
}


exports.tourByID= async (req,res)=>{
   try{
    const tour= await Tour.findById(req.params.id);
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



