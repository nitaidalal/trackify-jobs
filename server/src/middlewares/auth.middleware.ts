import {Request, Response,NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";

interface TokenPayload extends JwtPayload {
    _id: string;
}

const verifyJWT = asyncHandler(async(req:Request, res:Response, next:NextFunction): Promise<void> => {
    const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");;

    if(!token){
        return next(new ApiError(401, "Unauthorized - No token provided"));
    }

    let decodedToken: TokenPayload;
    try {
        decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET !) as TokenPayload;
    } catch (error) {
        return next(new ApiError(401, "Invalid token"));
    }

    const user = await User.findById(decodedToken._id)
    if(!user){
        return next(new ApiError(401, "Invalid token - User not found"));
    }

    req.user = {
        _id:user._id.toString(),
        name:user.name,
        email:user.email
    }
    next();
});

export { verifyJWT };