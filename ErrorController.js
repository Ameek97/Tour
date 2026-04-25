const AppError= require(`./appError`);
module.exports=(err,req,res,next)=>{

 const statusCode= err.statusCode || 500;
 const status=err.status || 'error';

  // we want all errors to be seen (we are developers)
 if(process.env.NODE_ENV=="development"){  
     
   res.status(statusCode).json({
   status:status,
   message:err.message, 
   stack: err.stack,
   error: err});
  
    // client will see the errors
}  else if(process.env.NODE_ENV=="production"){
    
    
    let error={...err};

    if(error.code==11000){error= new AppError("dublicate name",400);}

    // error due to client 
    if(err.isOperational==true){
        
        
        res.status(err.statusCode).json({
        status:err.status,
        message:err.message            
        })}  else {  // error in program

            console.error('ERROR 💥', err);

            res.status(500).json({
            status:'error',
            message: err.message
            });}}
}






