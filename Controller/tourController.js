const { route } = require('../Routes/tourRoutes');
const Tour= require('./../model/tourModel');
const APIfeatures= require(`./../Utils/APIfeatures`);
 

exports.getAllTours= async(req,res)=>{
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
       res 
        .status(400)
        .json({
            Status:"fail",
            Message:"error occured"})
    }
}



exports.postTour= async (req,res)=>{
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
  console.log(err.message);
  res
     .status(400)
     .json({
        Status:"Fail",
        Message:err.message
     })      }
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
       res 
        .status(400)
        .json({
            Status:"fail",
            Message:"error occured"})
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
     
     res
     .status(404)
     .json({
      status:`error`,
      message:err.message 
     })
}}



