function nodeEnv() {
  return String(process.env.NODE_ENV || '')
    .trim()
    .toLowerCase();
}

exports.nodeEnv = nodeEnv;

exports.isProduction = () => nodeEnv() === 'production';

exports.isDevelopment = () => nodeEnv() === 'development';
