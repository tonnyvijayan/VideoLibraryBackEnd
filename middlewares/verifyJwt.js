const jwt = require("jsonwebtoken");

const verifyJwt = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Unauthorized Access/ AuthHeader missing" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SIGNING_KEY, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .json({ message: "forbidden / accessToken expired" });
    }
    req.user = decoded.name;
    next();
  });
};

module.exports = { verifyJwt };
