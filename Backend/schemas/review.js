import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));


    const reviewSchema=mongoose.Schema({
        name:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true
            },
        rating:{
            type:Number,
            required:true
        },
        comment:{
            type:String,
            required:true
        }
    });

const Review=mongoose.model('Review',reviewSchema);
export default Review;  