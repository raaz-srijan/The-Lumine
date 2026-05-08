import {Router} from "express";
import { addRole, deleteRole, getRoleById, getRoles, updateRole } from "../controllers/roleController.js";
import { auth } from "../middlewares/auth.js";
import { rbac } from "../middlewares/rbac.js";

const route = Router();

route.use(auth);
route.get("/", rbac(["admin", "owner"]), getRoles);
route.get("/:id", rbac(["admin", "owner"]), getRoleById);
route.post("/add", rbac(["admin", "owner"]), addRole);
route.patch("/:id", rbac(["admin", "owner"]), updateRole);
route.delete("/:id", rbac(["admin", "owner"]), deleteRole);

export default route;