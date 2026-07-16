import express, { Application } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import { notFound } from "./middlewares/notFound.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import applicationRoutes from "./routes/application.routes.js";

const app: Application = express();

// ---------- Core middlewares ----------
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true, 
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" })); 
app.use(cookieParser());

// ---------- Logging ----------
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); 
}

// ---------- Routes (placeholder, we'll add real ones soon) ----------
app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({ success: true, message: "Server is healthy" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/applications", applicationRoutes);

// ---------- Error handling ----------
app.use(notFound); 
app.use(errorHandler);

export default app;