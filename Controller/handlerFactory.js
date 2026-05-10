


// when the delete one function is called, it calls the other fucntion inside 
exports.deleteOne=Model=>{ 

   return async(req,res,next)=>{    
try{
await Model.findByIdAndDelete(req.params.id)
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



