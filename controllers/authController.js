import bcrypt from 'bcrypt';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { passwordHasher } from '../utils/passwordUtils.js';
import { sendEmail } from '../utils/sendEmail.js';

//Day->2 : 
export const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        //Basic validation : ->
        if (!username || !email || !password) {
            return res.status(400).json({
                message: "(inside authController, basic vali..) All fields are required..."
            })
        }

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists.."
            })
        }

        //Hash Password: ->
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //Create new User : ->
        const user = new User(
            {
                username,
                email,
                password: hashedPassword,
            }
        );

        await user.save();

        //Exclude password from response: ->
        const userData = {};
        const userObject = user.toObject();

        for (const key in userObject) {
            if (key !== 'password') {
                userData[key] = userObject[key];
            }
        }

        return res.status(200).json({
            message: "User successfully registered...",
            user: userData,
        });

    } catch (error) {
        console.log("(inside /controllers/authControllers) Registration error: -> ", error);
        res.status(500).json({
            message: "Server Error..."
        })
    }
}

//Day-3 : ->
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "(inside  controllers loginContr) Email and password are required"
            })
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.send(400).json({
                message: "User does not exist, register first..!"
            })
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send({
                message: "Incorrect password !!"
            })
        }

        //Generate tokens: 
        const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

        const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });
        //save refreshToken in DB
        user.refreshToken = refreshToken;
        await user.save();

        const userObject = user.toObject();
        const userData = {};
        for (const key in userObject) {
            if (key !== 'password') {
                userData[key] = user[key];
            }
        }

        return res.status(200).json(
            { message: "Login successfull", user: userData, accessToken, refreshToken }
        );

    } catch (error) {
        console.log("Login Error: -> ", error);
        return res.status(400).json({
            message: "Login Error"
        })
    }

}

// Day -> 6 : 
export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "(inside Controllers/authCon/forgPass) User not found" });

        // Generate reset token : 
        const resetToken = crypto.randomBytes(32).toString('hex');
        //Hash Token before saving to DB
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Save hashed token & expiry (15 min) : 
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

        await user.save();

        // Generate reset URL (for now return in response...)
        const resetUrl = `http://localhost:3000/api/auth/reset-password/${resetToken}`;

        const messageHtml = `
      <h2>Password Reset Requested</h2>
      <p>Click the link below to reset your password. This link is valid for 15 minutes.</p>
      <a href="${resetUrl}">${resetUrl}</a>
    `;

        await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html: messageHtml,
      text: `Reset your password using this link: ${resetUrl}`,
    });
    res.json({ message: 'Password reset email sent' });

    } catch (error) {
        return res.status(500).json(
            {
                message: `Server error`, error: error.message
            }
        )
    }
}

// Reset Password : -> 
export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        // Hash the token to compare with DB 
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find user with valid reset token & not expired : 
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) return res.status(400).json({ message: "Invalid or expired token" });

        // Set new password : -> 
        user.password = await passwordHasher(password);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        return res.json({ message: "Password reset successful" });


    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
}