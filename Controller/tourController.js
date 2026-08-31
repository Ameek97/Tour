const Tour= require('../model/tourModel.js');
const APIfeatures= require(`./../Utils/APIfeatures`);
const handlerFactory=require('./handlerFactory');
const AppError= require('../appError');
const processTourImage= require('../Utils/processTourImage');
const {uploadImageBuffer}= require('../Utils/cloudinary');
const { stripOperatorKeys } = require('../Utils/sanitize');

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

exports.aliasTopCheapTours= (req,res,next)=>{
  req.query.sort='price';
  req.query.limit='5';
  req.query.page='1';
  next();
}

exports.getTourStats= async (req,res,next)=>{
  try{
    const stats= await Tour.aggregate([
      {
        $group:{
          _id:null,
          numberOfTours:{ $sum:1 },
          avgRating:{ $avg:'$ratingAverage' },
          avgPrice:{ $avg:'$price' },
          minPrice:{ $min:'$price' },
          maxPrice:{ $max:'$price' },
          rating5:{ $sum:{ $cond:[{ $eq:[{ $round:['$rating',0] },5] },1,0] } },
          rating4:{ $sum:{ $cond:[{ $eq:[{ $round:['$rating',0] },4] },1,0] } },
          rating3:{ $sum:{ $cond:[{ $eq:[{ $round:['$rating',0] },3] },1,0] } },
          rating2:{ $sum:{ $cond:[{ $eq:[{ $round:['$rating',0] },2] },1,0] } },
          rating1:{ $sum:{ $cond:[{ $eq:[{ $round:['$rating',0] },1] },1,0] } }
        }
      },
      {
        $project:{
          _id:0,
          numberOfTours:1,
          avgRating:1,
          avgPrice:1,
          minPrice:1,
          maxPrice:1,
          ratingDistribution:{
            5:'$rating5',
            4:'$rating4',
            3:'$rating3',
            2:'$rating2',
            1:'$rating1'
          }
        }
      }
    ]);

    res
    .status(200)
    .json({
        status:"success",
        data:{
          stats: stats[0] || {
            numberOfTours:0,
            avgRating:null,
            avgPrice:null,
            minPrice:null,
            maxPrice:null,
            ratingDistribution:{ 5:0, 4:0, 3:0, 2:0, 1:0 }
          }
        }
    });
  } catch(err){
    next(err);
  }
}

exports.getMonthlyPlan= async (req,res,next)=>{
  try{
    const year= Number(req.params.year);

    if(!Number.isInteger(year) || year<1000 || year>9999){
      return next(new AppError('Please provide a valid year',400));
    }

    const plan= await Tour.aggregate([
      { $unwind:'$startDates' },
      {
        $match:{
          startDates:{
            $gte: new Date(`${year}-01-01`),
            $lt: new Date(`${year+1}-01-01`)
          }
        }
      },
      {
        $group:{
          _id:{ $month:'$startDates' },
          numTourStarts:{ $sum:1 },
          tours:{ $push:'$name' }
        }
      },
      { $addFields:{ month:'$_id' } },
      { $project:{ _id:0 } },
      { $sort:{ month:1 } }
    ]);

    res
    .status(200)
    .json({
        status:"success",
        result:plan.length,
        data:{ plan }
    });
  } catch(err){
    next(err);
  }
}

const parseLatLng= (latlng)=>{
  if(!latlng || typeof latlng !== 'string'){
    return { error: new AppError('Please provide coordinates in the format lat,lng',400) };
  }

  const parts= latlng.split(',');
  if(parts.length !== 2){
    return { error: new AppError('Please provide coordinates in the format lat,lng',400) };
  }

  const latStr= parts[0].trim();
  const lngStr= parts[1].trim();

  if(latStr==='' || lngStr===''){
    return { error: new AppError('Please provide both latitude and longitude',400) };
  }

  const lat= Number(latStr);
  const lng= Number(lngStr);

  if(!Number.isFinite(lat) || !Number.isFinite(lng)){
    return { error: new AppError('Latitude and longitude must be valid numbers',400) };
  }

  if(lat < -90 || lat > 90 || lng < -180 || lng > 180){
    return { error: new AppError('Latitude must be between -90 and 90, and longitude between -180 and 180',400) };
  }

  return { lat, lng };
};

const getUnitMultiplier= (unit)=>{
  if(unit==='km'){return 0.001;}
  if(unit==='mi'){return 0.000621371;}
  return null;
};

exports.getToursWithin= async (req,res,next)=>{
  try{
    const { distance, latlng, unit }= req.params;

    const parsed= parseLatLng(latlng);
    if(parsed.error){return next(parsed.error);}

    const multiplier= getUnitMultiplier(unit);
    if(!multiplier){return next(new AppError('Unit must be km or mi',400));}

    const dist= Number(distance);
    if(!Number.isFinite(dist) || dist<=0){
      return next(new AppError('Please provide a valid distance',400));
    }

    const maxDistance= unit==='km' ? dist*1000 : dist*1609.34;

    const tours= await Tour.aggregate([
      {
        $geoNear:{
          near:{ type:'Point', coordinates:[parsed.lng, parsed.lat] },
          distanceField:'distance',
          maxDistance,
          distanceMultiplier: multiplier,
          spherical:true,
          key:'startLocation'
        }
      },
      { $limit: 50 }
    ]);

    res
    .status(200)
    .json({
        status:"success",
        result:tours.length,
        data:{ tours }
    });
  } catch(err){
    next(err);
  }
}

exports.getDistances= async (req,res,next)=>{
  try{
    const { latlng, unit }= req.params;

    const parsed= parseLatLng(latlng);
    if(parsed.error){return next(parsed.error);}

    const multiplier= getUnitMultiplier(unit);
    if(!multiplier){return next(new AppError('Unit must be km or mi',400));}

    const tours= await Tour.aggregate([
      {
        $geoNear:{
          near:{ type:'Point', coordinates:[parsed.lng, parsed.lat] },
          distanceField:'distance',
          distanceMultiplier: multiplier,
          spherical:true,
          key:'startLocation'
        }
      },
      { $limit: 50 }
    ]);

    res
    .status(200)
    .json({
        status:"success",
        result:tours.length,
        data:{ tours }
    });
  } catch(err){
    next(err);
  }
}

exports.postTour= async (req,res,next)=>{
try{
const newTour= await Tour.create(stripOperatorKeys(req.body || {}));
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

    const tour= await Tour.findByIdAndUpdate(
      req.params.id,
      stripOperatorKeys(req.body || {}),
      {
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

exports.updateTourImages= async (req,res,next)=>{
  try{
    const tour= await Tour.findById(req.params.id);

    if(!tour){
      return next(new AppError('no document with such id was found',404));
    }

    const coverFile= req.files && req.files.imageCover && req.files.imageCover[0];
    const galleryFiles= (req.files && req.files.images) || [];

    if(!coverFile && galleryFiles.length===0){
      return next(new AppError('No files uploaded',400));
    }

    if(coverFile){
      let processed;
      try{
        processed= await processTourImage(coverFile.buffer);
      } catch(err){
        return next(new AppError('Image processing failed',400));
      }

      try{
        tour.imageCover= await uploadImageBuffer(processed, 'natours/tours/cover');
      } catch(err){
        return next(new AppError('Image upload failed',500));
      }
    }

    if(galleryFiles.length>0){
      const imageUrls=[];
      for(const file of galleryFiles){
        let processed;
        try{
          processed= await processTourImage(file.buffer);
        } catch(err){
          return next(new AppError('Image processing failed',400));
        }

        try{
          imageUrls.push(await uploadImageBuffer(processed, 'natours/tours/gallery'));
        } catch(err){
          return next(new AppError('Image upload failed',500));
        }
      }
      tour.images= imageUrls;
    }

    await tour.save();

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
  try{
    await Tour.deleteMany({});
    return res.status(200).json({
      status:"success"});
  } catch(err){
    return next(err);
  }
}





