import {Router} from "express";
import { addItems, deleteItem, fetchItemById, fetchItems, updateItem } from "../controllers/inventoryController.js";
import { auth } from "../middlewares/auth.js";
import { rbac } from "../middlewares/rbac.js";

const route = Router();

route.use(auth);
route.get("/", rbac(["admin", "owner", "staff"]), fetchItems);
route.post("/add", rbac(["admin", "owner", "create:inventory"]), addItems);
route.get("/:id", rbac(["admin", "owner", "staff", "read:inventory"]), fetchItemById);
route.put("/:id", rbac(["admin", "owner", "staff", "update:inventory"]), updateItem);
route.delete("/:id", rbac(["admin", "owner", "delete:inventory"]), deleteItem);

export default route;