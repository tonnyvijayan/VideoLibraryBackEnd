const jwt = require("jsonwebtoken");

const verifyJwt = (req, res, next) => {
  console.log("verify jwt fired");
  const authHeader = req.headers["authorization"];
  console.log({ authHeader });
  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Unauthorized Access/ AuthHeader missing" });
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SIGNING_KEY, (err, decoded) => {
    console.log(decoded);
    if (err) {
      return res
        .status(403)
        .json({ message: "forbidden / accessToken expired" });
    }
    console.log(decoded);
    req.user = decoded.name;
    console.log(req.user);
    next();
  });
};

module.exports = { verifyJwt };
