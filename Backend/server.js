import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import connectDB from "./config/dbConn.js";
import authRoute from "./routes/auth.js";
import errorHandler from "./middleware/errorHandler.js";
import logoutRoute from "./routes/logout.js";
import refreshRoute from "./routes/refreshToken.js";
import verifyJWT from "./middleware/verifyJWT.js";
import officerRoute from "./routes/api/officer.js";
import usersRoute from "./routes/api/users.js";
import studentRoute from "./routes/api/student.js";

const app = express();
const PORT = 3500;

connectDB();

// Specify allowed URL to communicate to endpoint
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://clearancesystem.onrender.com",
      "http://127.0.0.1:5500",
    ],
    credentials: true,
  })
);

// Parse JSON into req.body
app.use(express.json());
// Parse cookies into req.cookies
app.use(cookieParser());

app.use("/auth", authRoute);
app.use("/refresh", refreshRoute);
app.use("/logout", logoutRoute);

app.use(verifyJWT);

app.use("/api/users", usersRoute);
app.use("/api/officers", officerRoute);
app.use("/api/students", studentRoute);

// Handle page not found
app.use((req, res) => {
  res.status(404).json({ error: "Route not found." });
});

// Handle error
app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("MongoDB connected");

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
