import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import healthRoute from './routes/health.js';
import authRoute from './routes/auth.js';

const app = express();

//middlewares: ->
app.use(cors());
app.use(express.json());

//routes: ->
app.use('/api/health', healthRoute);
app.use('/api/auth', authRoute);
//connect DB and start server: ->
const PORT = process.env.PORT;
connectDB();

app.listen(PORT, () => {
    console.log(`Server running on port : ${PORT}`);
})


