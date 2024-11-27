
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  firstname: { type: String },
  lastname: { type: String },
  username: { type: String, required: true, unique: true },
  phoneNumber: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user",  "admin"], default: "user" },
  gender: { type: String},
  avatarUrl: { 
    public_id: {
      type: String,
     // Public ID from Cloudinary
    },
    url: {
      type: String,
     // URL of the uploaded image
    },
   },
  birthdate: { type: Date },
  cartData: { type: Object, default:{} },
  vouchers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Voucher" }],
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  orderedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
  createdAt: { type: Date, default: Date.now },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  emailVerificationToken: { type: String },
});

// Hash password before saving the user document
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.isPasswordValid = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
userSchema.methods.generateVerificationToken = function () {
  const token = crypto.randomBytes(20).toString("hex");
  this.emailVerificationToken = token;
  return token;
};

const User = mongoose.model("User", userSchema);
export default User;