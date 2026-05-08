import "dotenv/config";

import express from "express";
import { ENV } from "./config/env.js";
import { connectDb } from "./config/connectDb.js";
import * as route from "./routes/index.js";
import cors from "cors";

const app = express();
app.use(express.json());

app.use(cors({
    origin:ENV.FRONTEND_URL
}));

app.use("/api/v1/permissions", route.permissionRoute);
app.use("/api/v1/roles", route.roleRoute);
app.use("/api/v1/auth", route.userRoute);
app.use("/api/v1/category", route.categoryRoute);
app.use("/api/v1/inventory", route.inventoryRoute);
app.use("/api/v1/appointments", route.appointmentRoute);
app.use("/api/v1/dashboard", route.dashboardRoute);

const PORT = ENV.PORT;

app.listen(PORT, ()=> {
    console.log(`Server started on ${PORT}`);
    connectDb();
});