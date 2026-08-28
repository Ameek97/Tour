const sharp = require('sharp');

module.exports = buffer => {
  return sharp(buffer)
    .resize(2000, 1333, { fit: 'cover' })
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toBuffer();
};
