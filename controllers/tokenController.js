import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

//Refresh access Tokens :->
export const refreshAccessToken = async (req, res) => {
    try {
        
        const {refreshToken} = req.body;
        if (!refreshToken) return res.status(401).json({ message: 'No refresh token provided' });

        const user = await User.findOne({refreshToken});
        if(!user) return res.status(400).json({message: "Invalid refresh Token"});

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if(err) return res.status(403).json({
                message: 'Invalid or expired refresh token...'
            });

            const newAccessToken = jwt.sign(
                {id: user._id, role: user.role},
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn: '15m'}
            );

            res.json({accessToken: newAccessToken});
        })

    } catch (error) {
        console.error('(inside /controllers/tokenController) Refresh Error: ', error);
        res.status(500).json({
            message: 'Server Error'
        });
    }
}
//Logout invalidate refresh token : ->
export const logoutUser = async (req, res) => {
    try {
        const {refreshToken} = req.body;

        if(!refreshToken) return res.status(400).json({
            message: "in controllers/tokenController, no refresh token provided"
        });
        const user = await User.findOne({refreshToken});

        if(!user) return res.status(400).json({message: "(controllers/tokenController), Invalid refresh Token"})

        user.refreshToken = null;
        await user.save();

        res.json({message : "Logged out successfully"});
    } catch (error) {
        console.error("Logout Error(controllers/tokenController) => ", error);
        res.status(500).json({message: "Server Error!"});
    }
}