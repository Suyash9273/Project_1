import mongoose from "mongoose"

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    }, 
    email: {
        type: String, 
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    }, 
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
    }, 
    role: {
        type: String,
        enum: ['user', 'moderator', 'admin'],
        default: 'user'
    }, 
    refreshToken: {
        type: String,
    }, //New field added on day-5
    resetPasswordToken: {type: String},
    resetPasswordExpire: {type: Date},
}, {timestamps: true});

export const User = mongoose.model('User', userSchema);
