import { Router } from "express";
import { approvalRequest, assignRole, getUsers, login, register, revokeAuthority, updateMe, verifyEmail, getApprovedStaff, refreshToken } from "../controllers/userController.js";
import { auth } from "../middlewares/auth.js";
import { rbac } from "../middlewares/rbac.js";

const route = Router();

route.post("/register", register);
route.post("/login", login);
route.post("/refresh", refreshToken);
route.patch("/approve/:id", auth, rbac(["owner"]), approvalRequest);
route.patch("/revoke/:id", auth, rbac(["owner"]), revokeAuthority);
route.patch("/assign/:id", auth, rbac(["owner"]), assignRole);
route.put("/update", auth, updateMe);
route.get("/verify/:token", verifyEmail);
route.get("/approved-staff", auth, getApprovedStaff);
route.get("/all", auth, rbac(["admin", "owner"]), getUsers);

export default route;