import { Router } from "express";
import {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  getStats,
} from "../controllers/application.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createApplicationSchema,
  updateApplicationSchema,
} from "../validators/application.validator.js";

const router = Router();

router.use(verifyJWT); 

// ---------- Stats (must be before /:id to avoid conflict) ----------
router.get("/stats", getStats);

// ---------- CRUD routes ----------
router.post("/", validate(createApplicationSchema), createApplication);
router.get("/", getApplications);
router.get("/:id", getApplicationById);
router.patch("/:id", validate(updateApplicationSchema), updateApplication);
router.delete("/:id", deleteApplication);

export default router;