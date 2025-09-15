import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log("DB connected successfully..!");
    } catch (error) {
        console.log("Error in db connection : ", error);
        process.exit(1);
    }
}
export default connectDB;