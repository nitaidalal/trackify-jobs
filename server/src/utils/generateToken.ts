import { Response } from "express";
import { IUser } from "../models/user.model.js";

const generateAccessAndRefreshTokens = async (
  user: IUser,
  res: Response,
): Promise<{ accessToken: string; refreshToken: string }> => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
  };



  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: process.env.REFRESH_TOKEN_EXPIRY as any,
  });

  return { accessToken, refreshToken };
};

export { generateAccessAndRefreshTokens };
