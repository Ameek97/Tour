const AppError = require("../appError")



// when the delete one function is called, it calls the other fucntion inside 
exports.deleteOne=Model=>{ 

   return async(req,res,next)=>{    
try{
const doc = await Model.findByIdAndDelete(req.params.id)

if(!doc){return next(new AppError('no document with such id was found',404));}

res
   .status(200)
   .json({
    status:`Success`,
    message:`record succesfully deleted`
   })
} catch(err){
     next(err);
}}

}



