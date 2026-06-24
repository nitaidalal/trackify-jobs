import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";

const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new ApiError(404, `Route not found - ${req.originalUrl}`);
  next(error);
};

export { notFound };