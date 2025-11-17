import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";

const app = express();
const port = process.env.PORT || 4000;

// Connect MongoDB
connectDB();

// ✅ Correct CORS Setup for Render + Localhost
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://mern-auth-fr.onrender.com",
      "https://www.mern-auth-fr.onrender.com" // Render sometimes adds 'www'
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // IMPORTANT for cookies
  })
);

// Middleware
app.use(express.json());
app.use(cookieParser());

// API Routes
app.get("/", (req, res) => res.send("API working!!"));
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

// Start Server
app.listen(port, () => console.log(`Server started on PORT: ${port}`));
