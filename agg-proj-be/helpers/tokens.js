const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY 



/** return signed JWT from user data. */

function createToken(user) {

  let payload = {
    user: user
  };

  return jwt.sign(payload, SECRET_KEY);
}

module.exports = { createToken };