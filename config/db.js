import mongoose from "mongoose";


export const connectDB = async () => {
    await mongoose.connect('mongodb://localhost:27017/Foods').then(()=>console.log('DB Connected'));
}