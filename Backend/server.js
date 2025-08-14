import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import connectDB from "./Config/dbConn.js";
import authRoute from "./Routes/auth.js";
import errorHandler from "./Middleware/errorHandler.js";
import logoutRoute from "./Routes/logout.js";
import refreshRoute from "./Routes/refreshToken.js";
import verifyJWT from "./Middleware/verifyJWT.js";
import officerRoute from "./Routes/api/officer.js";
import usersRoute from "./Routes/api/users.js";
import studentRoute from "./Routes/api/student.js";

const app = express();
const PORT = 3500;

connectDB();

// Specify allowed URL to communicate to endpoint
// app.use(
//   cors({
//     origin: ["http://localhost:5173", "https://clearancesystem.vercel.app"],
//     credentials: true,
//   })
// );

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
