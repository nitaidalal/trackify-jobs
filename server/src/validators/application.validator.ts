import { z } from "zod";

const statusEnum = z.enum([
  "wishlist",
  "applied",
  "shortlisted",
  "assessment",
  "interview",
  "offer",
  "rejected",
]);

const workModeEnum = z.enum(["remote", "hybrid", "in-office"]);

const sourceEnum = z.enum([
  "LinkedIn",
  "Naukri",
  "Internshala",
  "Wellfound",
  "Instahyre",
  "Referral",
  "Career Page",
]);

export const createApplicationSchema = z.object({
  body: z.object({
    company: z
      .string()
      .min(1, "Company name is required")
      .trim(),
    role: z
      .string()
      .min(1, "Job role is required")
      .trim(),
    status: statusEnum.default("applied"),
    workMode: workModeEnum,
    source: sourceEnum.optional(),
    appliedDate: z
      .string()
      .optional()
      .transform((val) => (val ? new Date(val) : new Date())),
    jobLink: z
      .string()
      .url("Invalid URL — must start with http:// or https://")
      .optional()
      .or(z.literal("")),
    notes: z
      .string()
      .max(500, "Notes cannot exceed 500 characters")
      .optional(),
    salary: z
      .number()
      .min(0, "Salary cannot be negative")
      .optional(),
    location: z
      .string()
      .trim()
      .optional(),
  }),
});

export const updateApplicationSchema = z.object({
  body: z
    .object({
      company: z.string().min(1).trim().optional(),
      role: z.string().min(1).trim().optional(),
      status: statusEnum.optional(),
      workMode: workModeEnum.optional(),
      source: sourceEnum.optional(),
      appliedDate: z
        .string()
        .optional()
        .transform((val) => (val ? new Date(val) : undefined)),
      jobLink: z
        .string()
        .url("Invalid URL")
        .optional()
        .or(z.literal("")),
      notes: z.string().max(500).optional(),
      salary: z.number().min(0).optional(),
      location: z.string().trim().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided to update",
    }),
  params: z.object({
    id: z.string().min(1, "Application ID is required"),
  }),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema.shape.body>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema.shape.body>;