
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const jwtSecret = process.env.JWT_SECRET || "default_secret";
const jwtExpiry = "7d";

export const generateToken = (payload) => {
  return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiry });
};

export const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access Denied" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid Token" });
  }
};

export default { generateToken, verifyToken };