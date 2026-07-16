import { Request, Response, NextFunction } from "express";
import jwt ,{JwtPayload} from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import { generateAccessAndRefreshTokens } from "../utils/generateToken.js";
import { RegisterInput, LoginInput } from "../validators/auth.validator.js";

// @route   POST /api/v1/auth/register
export const registerUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { name, email, password } = req.body as RegisterInput;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ApiError(400, "User already exists"));
    }

    const user = await User.create({ name, email, password });

    //fetch created user without password
    const createdUser = await User.findById(user._id);
    if (!createdUser) {
      return next(new ApiError(500, "Something went wrong while registering"));
    }

    //genrate token and set cookie
    const { accessToken } = await generateAccessAndRefreshTokens(
      createdUser,
      res,
    );

    res.status(201).json(
      new ApiResponse(
        201,
        {
          user: {
            _id: createdUser._id,
            name: createdUser.name,
            email: createdUser.email,
          },
          accessToken,
        },
        "User registered successfully",
      ),
    );
  },
);

// @route   POST /api/v1/auth/login
export const loginUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body as LoginInput;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(new ApiError(401, "Invalid email or password"));
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      return next(new ApiError(401, "Invalid email or password"));
    }

    // Generate tokens and set cookie
    const { accessToken } = await generateAccessAndRefreshTokens(user, res);

    res.status(200).json(
      new ApiResponse(
        200,
        {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
          },
          accessToken,
        },
        "Login successful",
      ),
    );
  },
);


// @route   POST /api/v1/auth/logout
export const logoutUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    await User.findByIdAndUpdate(req.user!._id, {
      $unset: { refreshToken: 1 },
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json(new ApiResponse(200, null, "Logout successful"));
  },
);


// @route   GET /api/v1/auth/me
export const getCurrentUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    res.status(200).json(new ApiResponse(200, { user: req.user }, "User fetched successfully"));
  },
);

interface TokenPayload extends JwtPayload {
  _id: string;
}

// @route   GET /api/v1/auth/refresh

export const refreshAccessToken = asyncHandler(
  async (req:Request, res:Response, next:NextFunction):Promise<void> => {
    const refreshToken = req.cookies?.refreshToken;
    if( !refreshToken){
      throw new ApiError(401, "Unauthorized - No refresh token provided"); 
    }

    let decodedToken: TokenPayload;
    try {
      decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as TokenPayload;
    } catch (error) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const user = await User.findById(decodedToken._id).select("+refreshToken");
    if(!user || user.refreshToken !== refreshToken){
      throw new ApiError(401, "Invalid refresh token");
    }

    const {accessToken} = await generateAccessAndRefreshTokens(user,res);

    res.status(200).json(new ApiResponse(200, { accessToken }, "Access token refreshed successfully"));
  }
)