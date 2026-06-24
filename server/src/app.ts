import express, { Application } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import { notFound } from "./middlewares/notFound.middleware.js";

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
  app.use(morgan("dev")); // logs each request: method, url, status, response time
}

// ---------- Routes (placeholder, we'll add real ones soon) ----------
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is healthy" });
});

// ---------- Error handling (must be last) ----------
app.use(notFound); // catches unmatched routes → 404
app.use(errorHandler); // catches all thrown/forwarded errors → formatted response

export default app;