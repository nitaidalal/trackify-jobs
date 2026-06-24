import mongoose, { Schema, Document, Model } from "mongoose";

export type ApplicationStatus =
  | "wishlist"
  | "applied"
  | "shortlisted"
  | "assessment"
  | "interview"
  | "offer"
  | "rejected";

export type ApplicationSource =
  | "LinkedIn"
  | "Naukri"
  | "Internshala"
  | "Wellfound"
  | "Referral"
  | "Instahyre"
  | "Career Page";

export type WorkMode = "remote" | "hybrid" | "in-office";


export interface IApplication extends Document {
  user: mongoose.Types.ObjectId;
  company: string;
  role: string;
  status: ApplicationStatus;
  source?: ApplicationSource;
  appliedDate: Date;
  jobLink?: string;
  notes?: string;
  salary?: number;
  workMode: WorkMode;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}


const applicationSchema = new Schema<IApplication>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    role: {
      type: String,
      required: [true, "Job role is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: [
          "wishlist",
          "applied",
          "shortlisted",
          "assessment",
          "interview",
          "offer",
          "rejected",
        ],
        message: "{VALUE} is not a valid status",
      },
      default: "applied",
    },
    source: {
      type: String,
      enum: {
        values: ["LinkedIn", "Naukri", "Internshala","Wellfound", "Referral", "Instahyre", "Career Page"],
        message: "{VALUE} is not a valid source",
      },
    },
    appliedDate: {
      type: Date,
      required: [true, "Applied date is required"],
      default: Date.now,
    },
    jobLink: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, "Invalid URL"],
    },
    notes: {
      type: String,
      trim: true,
    },
    salary: {
      type: Number,
      min: [0, "Salary cannot be negative"],
    },
    workMode: {
        type: String,
        enum: {
          values: ["remote", "hybrid", "in-office"],
          message: "{VALUE} is not a valid work mode",
        },
        required: [true, "Work mode is required"],
      },
    location: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// ---------- Index for faster queries ----------
applicationSchema.index({ user: 1, status: 1 });
applicationSchema.index({ user: 1, createdAt: -1 });

const Application: Model<IApplication> = mongoose.model<IApplication>(
  "Application",
  applicationSchema
);

export default Application;