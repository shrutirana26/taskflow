const jwt = require('jsonwebtoken');

const generateToken = (userId, rememberMe = false) => {
  const expiresIn = rememberMe ? '30d' : '1d';
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'taskflow_dev_secret_key_987654321',
    {
      expiresIn,
    }
  );
};

module.exports = generateToken;
