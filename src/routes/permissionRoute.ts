import { Router } from "express";
import { addPermission, deletePermission, getPermissionById, getPermissions, updatePermission } from "../controllers/permissionController.js";
import { auth } from "../middlewares/auth.js";
import { rbac } from "../middlewares/rbac.js";

const route = Router();

route.use(auth);
route.get("/", rbac(["admin", "owner"]), getPermissions);
route.get("/:id", rbac(["admin", "owner"]), getPermissionById);
route.put("/:id", rbac(["admin", "owner"]), updatePermission);
route.post("/add", rbac(["admin", "owner"]), addPermission);
route.delete("/:id", rbac(["admin", "owner"]), deletePermission);

export default route;