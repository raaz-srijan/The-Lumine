import express from "express";
import { getDashboardStats, getAdminDashboardStats, getStaffDashboardStats } from "../controllers/dashboardController.js";
import { auth } from "../middlewares/auth.js";
import { rbac } from "../middlewares/rbac.js";

const router = express.Router();

router.use(auth);

// Unified endpoint (auto-detects role)
router.get("/stats", rbac(["admin", "owner", "staff"]), getDashboardStats);

// Granular endpoints (explicit)
router.get("/admin", rbac(["admin", "owner"]), getAdminDashboardStats);
router.get("/staff", rbac(["staff"]), getStaffDashboardStats);

export default router;
