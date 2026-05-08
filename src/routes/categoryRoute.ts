import { Router } from "express";
import { addCat, deleteCat, getCat, getCatById, updateCat } from "../controllers/categoryController.js";
import { auth } from "../middlewares/auth.js";

const route = Router();

route.use(auth);
route.get("/", getCat);
route.get("/:catId", getCatById);
route.post("/", addCat);
route.patch("/:catId", updateCat);
route.delete("/:catId", deleteCat);

export default route;