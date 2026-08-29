const User = require('./../model/userModel');
const AppError = require('./../appError');

exports.getAllUsers=async (req,res,next)=>{

  try{
   const users= await User.find();
   
    res. status(200).json({
        status:"Success",
        result:users.length,
        user:users
    });

  } catch(err){return next(err);}

}

exports.updateMe = async (req, res, next) => {
  try {
    if (req.body && (req.body.password || req.body.passwordConfirm || req.body.role)) {
      return next(
        new AppError(
          'This route is not for password or role updates.',
          400
        )
      );
    }

    const update = {};
    if (req.body && req.body.name !== undefined) {
      update.name = req.body.name;
    }
    if (req.body && req.body.email !== undefined) {
      update.email = req.body.email;
    }
    if (req.body && req.body.photo !== undefined) {
      update.photo = req.body.photo;
    }

    const user = await User.findByIdAndUpdate(req.user.id, update, {
      new: true,
      runValidators: true
    });

    if (!user) {
      return next(new AppError('The user this token belongs to no longer exists.', 401));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          photo: user.photo
        }
      }
    });
  } catch (err) {
    return next(err);
  }
};

exports.deleteMe=async (req,res,next)=>{
  try{
    await User.findByIdAndUpdate(req.user.id, {active:false});
    res.status(200)
       .json({status:"succesful",
              message: "user deleted"});
  } catch(err){return next(err);}
}