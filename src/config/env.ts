import "dotenv/config";

if(!process.env)
     throw new Error("No environments data available");

export const ENV = {
    PORT: Number(process.env.PORT),
    MONGO_URI: String(process.env.MONGO_URI),
    JWT_SECRET_KEY: String(process.env.JWT_SECRET_KEY),
    JWT_REFRESH_KEY: String(process.env.JWT_REFRESH_KEY),
    JWT_SECRET_TIMEOUT: String(process.env.JWT_SECRET_TIMEOUT),
    JWT_REFRESH_TIMEOUT: String(process.env.JWT_REFRESH_TIMEOUT),
    FRONTEND_URL: String(process.env.FRONTEND_URL),
    SMTP_PORT: Number(process.env.SMTP_PORT),
    SMTP_MAIL: String(process.env.SMTP_MAIL),
    SMTP_PASS: String(process.env.SMTP_PASS)
}