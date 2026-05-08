import { Router } from "express";
import { createAppointment, deleteAppointment, getAppointments, updateAppointment, getAppointmentStats } from "../controllers/appointmentController.js";
import { auth } from "../middlewares/auth.js";
import { rbac } from "../middlewares/rbac.js";

const route = Router();

route.use(auth)
route.get("/", rbac(["staff", "owner", "admin"]), getAppointments);
route.get("/get-stats", rbac(["staff", "owner", "admin"]), getAppointmentStats);
route.post("/", rbac(["staff", "admin", "owner"]), createAppointment);
route.put("/:id/update", rbac(["staff", "admin", "owner"]), updateAppointment);
route.delete("/:id/delete", rbac(["admin", "owner"]), deleteAppointment);

export default route;