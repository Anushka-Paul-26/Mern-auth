import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";

const app = express();
const port = process.env.PORT || 4000;

// DB connect
connectDB();

// ✅ CORS setup
const FRONTEND_URL =
  process.env.NODE_ENV === "production"
    ? "https://mern-auth-fr.onrender.com"
    : "http://localhost:5173";

app.use(
  cors({
    origin: [
      "https://mern-auth-fr.onrender.com",
      "http://localhost:5173"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);


// Middleware
app.use(express.json());
app.use(cookieParser());

// API routes
app.get("/", (req, res) => res.send("API working!!"));
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

app.listen(port, () => console.log(`Server started on PORT: ${port}`));
