import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { auth } from "../middlewares/auth.js";
import { rbac } from "../middlewares/rbac.js";

const router = express.Router();

router.get("/stats", auth, rbac(["admin", "owner", "staff"]), getDashboardStats);

export default router;
