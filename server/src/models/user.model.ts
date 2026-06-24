import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select:false
    },
  },
  { timestamps: true }
);

// ---------- Hash password before saving ----------
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return ;
  this.password = await bcrypt.hash(this.password, 10)  ;
});

// ---------- Instance method: compare entered password with hashed one ----------
userSchema.methods.isPasswordCorrect = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

// ---------- Instance method: generate short-lived access token ----------
userSchema.methods.generateAccessToken = function (): string {
  return jwt.sign(
    { _id: this._id, email: this.email, name: this.name },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY as any }
  );
};

// ---------- Instance method: generate long-lived refresh token ----------
userSchema.methods.generateRefreshToken = function (): string {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY as any }
  );
};

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;