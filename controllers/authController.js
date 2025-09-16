import bcrypt from 'bcrypt';
import {User} from '../models/User.js';

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