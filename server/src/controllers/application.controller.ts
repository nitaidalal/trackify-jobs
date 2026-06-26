import { Request, Response, NextFunction } from "express";
import {CreateApplicationInput,UpdateApplicationInput} from "../validators/application.validator.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Application from "../models/application.model.js";


// @desc    Create a new job application
// @route   POST /api/v1/applications
export const createApplication = asyncHandler(async (req:Request, res:Response):Promise<void> => {
    const {company,role,status,workMode,source,appliedDate,jobLink,notes,salary,location} = req.body as CreateApplicationInput;

    const application = await Application.create({
        user: req.user!._id,
        company,
        role,
        status,
        workMode,
        source,
        appliedDate,
        jobLink,
        notes,
        salary,
        location
    });

    res.status(201).json(new ApiResponse(201, application, "Application created successfully"));
});

// -----------------------------------------------------------------------
// @desc    Get all applications for logged in user
// @route   GET /api/v1/applications
export const getApplications = asyncHandler(async(req:Request, res:Response):Promise<void> => {
  const {
    status,
    workMode,
    source,
    search,
    sortBy = "createdAt",
    order = "desc",
    page = "1",
    limit = "10",
  } = req.query as {
    status?: string;
    workMode?: string;
    source?: string;
    search?: string;
    sortBy?: string;
    order?: string;
    page?: string;
    limit?: string;
  };

  //filter
  const filter: Record<string, any> = { user: req.user!._id };

  if (status) filter.status = status;
  if (workMode) filter.workMode = workMode;
  if (source) filter.source = source;

  if (search) {
    filter.$or = [
      { company: { $regex: search, $options: "i" } },
      { role: { $regex: search, $options: "i" } },
    ];
  }

  // ---------- Pagination ----------
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Math.max(1, Number(limit) || 10));
  const skip = (pageNum - 1) * limitNum;

  // ---------- Sort ----------
  const allowedSortFields = ["createdAt", "appliedDate", "company", "role"];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
  const sortOrder = order === "asc" ? 1 : -1;

  // ---------- Query ----------
  const [applications,total] = await Promise.all([
    Application.find(filter)
      .sort({[sortField]:sortOrder})
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Application.countDocuments(filter)
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        applications,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
          hasNextPage: pageNum < Math.ceil(total / limitNum),
          hasPrevPage: pageNum > 1,
        },
      },
      "Applications fetched successfully",
    ),
  );
})

// -----------------------------------------------------------------------
// @desc    Get single application by ID
// @route   GET /api/v1/applications/:id
export const getApplicationById = asyncHandler(async(req:Request, res:Response):Promise<void> => {
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user!._id,
    });

    if(!application){
        throw new ApiError(404, "Application not found");
    }

     res
      .status(200)
      .json(
        new ApiResponse(200, application, "Application fetched successfully"),
      );
})

// -----------------------------------------------------------------------
// @desc    Update application
// @route   PATCH /api/v1/applications/:id
export const updateApplication = asyncHandler(async(req:Request, res:Response):Promise<void> => {
    const updates = req.body as UpdateApplicationInput;

    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, user: req.user!._id },
      { $set: updates },
      { new: true, runValidators: true },
    );

    if(!application){
        throw new ApiError(404, "Application not found");
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, application, "Application updated successfully"),
      );
})

// -----------------------------------------------------------------------
// @desc    Delete application
// @route   DELETE /api/v1/applications/:id
export const deleteApplication = asyncHandler(async(req:Request, res:Response):Promise<void> =>{
    const application = await Application.findOneAndDelete({
        _id: req.params.id,
        user: req.user!._id,
      });
  
      if (!application) {
        throw new ApiError(404, "Application not found");
      }

      res
        .status(200)
        .json(new ApiResponse(200, null, "Application deleted successfully"));
})


// -----------------------------------------------------------------------
// @desc    Get dashboard stats
// @route   GET /api/v1/applications/stats
export const getStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const stats = await Application.aggregate([
    { $match: { user: req.user!._id } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  // Convert array to object for easier frontend consumption
  const formattedStats = {
    total: 0,
    wishlist: 0,
    applied: 0,
    shortlisted: 0,
    assessment: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
  };

  stats.forEach((stat) => {
    const status = stat._id as keyof typeof formattedStats;
    if (status in formattedStats) {
      formattedStats[status] = stat.count;
      formattedStats.total += stat.count;
    }
  });

  res
    .status(200)
    .json(new ApiResponse(200, formattedStats, "Stats fetched successfully"));
});