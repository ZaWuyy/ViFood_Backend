
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const jwtSecret = process.env.JWT_SECRET || "default_secret";
const jwtExpiry = "7d";

export const generateToken = (payload) => {
  try {
    if (!payload) {
      throw new Error("Payload is missing");
    }
    console.log("Generating token:", payload);
    console.log("jwtSecret:", jwtSecret);
    console.log("jwtExpiry:", jwtExpiry);
    return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiry });
  }
  catch (error) {
    console.error("Error generating token:", error);
    throw error;
  }
 
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
const token = generateToken({ id: 1, role: "admin" });
console.log("Generated token:", token);

export default { generateToken, verifyToken };