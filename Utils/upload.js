const multer = require('multer');
const AppError = require('../appError');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files are allowed', 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadTourImageFields = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 8 }
]);

exports.uploadTourImages = (req, res, next) => {
  uploadTourImageFields(req, res, err => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('Image file is too large. Maximum size is 5MB', 400));
        }
        return next(new AppError(err.message, 400));
      }
      return next(err);
    }
    next();
  });
};
