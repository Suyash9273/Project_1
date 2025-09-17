import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

//Protected route for any authenticated user : -> 
router.get('/me', authenticate, (req, res) => {
    res.json({
        message: "User profile fetched successfully",
        user: req.user
    })
});

//Protected route for admins only : -> 
router.get('/admin', authenticate, authorize(['admin']), (req, res) => {
    res.json({
        message: "Welcome admin, you have full access !!"
    })
});

// Protected route for moderators and admins
router.get('/moderator', authenticate, authorize(['moderator', 'admin']), (req, res) => {
    res.json({ message: 'Welcome, Moderator! You can manage content.' });
});

export default router;
