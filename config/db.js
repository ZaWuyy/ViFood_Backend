import mongoose from "mongoose";


export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://GiaHuy:123456789nt@cluster0.ltdhd.mongodb.net/Vegeterian-project').then(()=>console.log('DB Connected'));
}