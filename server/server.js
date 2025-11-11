import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from './routes/authRoutes.js';
import userRouter from "./routes/userRoutes.js";

const app = express();
const port = process.env.PORT || 4000;

connectDB();

// allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'https://mern-auth-fr.onrender.com'
];

// CORS middleware
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // allow Postman/curl requests
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('Not allowed by CORS'), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// middlewares
app.use(express.json());
app.use(cookieParser());

// API endpoints
app.get('/', (req, res) => res.send("API working!!"));
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

app.listen(port, () => console.log(`Server started on PORT: ${port}`));
