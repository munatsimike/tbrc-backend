import jwt from "jsonwebtoken";
import { deobfuscateUserId } from "../controllers/helpers/obfuscation.js";

const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, "fallingisflyingexceptwithamorepermanentdestination", (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = decoded;
    req.user.id = deobfuscateUserId(req.user.id);
    
    next();
  });
};

export default authMiddleware;
