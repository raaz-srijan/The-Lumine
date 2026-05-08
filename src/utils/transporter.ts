import nodemailer from "nodemailer";
import { ENV } from "../config/env.js";

export const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: ENV.SMTP_PORT,
    secure:true,
    auth:{
        user:ENV.SMTP_MAIL,
        pass:ENV.SMTP_PASS,
    }
});
