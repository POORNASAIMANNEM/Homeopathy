import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phno: { type: String, required: true },
    age: { type: String, required: true },
    address: { type: String, required: true },
    sex: { type: String, required: true },
    medicalConcern: { type: [String], required: true },
    prescription: {
        type: [{
            tablets: { type: String, required: true },
            dosage: { type: String, required: true },
            duration: { type: String, required: true },
            date: { type: Date, default: Date.now }
        }],
        required: false
    },
    newPrescription: {
        type: [{
            tablets: { type: String, required: true },
            dosage: { type: String, required: true },
            duration: { type: String, required: true },
            date: { type: Date, default: Date.now }
        }],
        required: false
    },
    isCompleted: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;