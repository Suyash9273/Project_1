import bcrypt from 'bcrypt';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';

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