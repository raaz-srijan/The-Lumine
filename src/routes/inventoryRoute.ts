import {Router} from "express";
import { addItems, deleteItem, fetchItemById, fetchItems, updateItem, getInventoryStats } from "../controllers/inventoryController.js";
import { auth } from "../middlewares/auth.js";
import { rbac } from "../middlewares/rbac.js";

const route = Router();

route.use(auth);

route.get("/", rbac(["admin", "owner", "staff"]), fetchItems);
route.get("/get-stats", rbac(["admin", "owner"]), getInventoryStats);
route.post("/add", rbac(["admin", "owner"]), addItems);

route.get("/:id", rbac(["admin", "owner", "staff"]), fetchItemById);
route.put("/:id", rbac(["admin", "owner"]), updateItem);
route.delete("/:id", rbac(["admin", "owner"]), deleteItem);

export default route;