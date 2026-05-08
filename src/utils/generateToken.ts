import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import { ENV } from "../config/env.js";

const JWT_SECRET_KEY = ENV.JWT_SECRET_KEY
const JWT_SECRET_TIMEOUT = ENV.JWT_SECRET_TIMEOUT
const JWT_REFRESH_KEY = ENV.JWT_REFRESH_KEY
const JWT_REFRESH_TIMEOUT = ENV.JWT_REFRESH_TIMEOUT

export interface PayloadType extends JwtPayload {
    id: string | null,
    email?: string | null,
    role?: string | null
}

export const generateJWT = (payload: PayloadType, expiresIn = JWT_SECRET_TIMEOUT as NonNullable<SignOptions["expiresIn"]>): string => {
    return jwt.sign(payload, JWT_SECRET_KEY, { expiresIn });
}

export const generateRefreshJWT = (payload: PayloadType, expiresIn = JWT_REFRESH_TIMEOUT as NonNullable<SignOptions["expiresIn"]>): string => {
    return jwt.sign(payload, JWT_REFRESH_KEY, { expiresIn });
}


export const verifyJWT = (token: string) => {
    return jwt.verify(token, JWT_SECRET_KEY);
}


export const verifyRefreshJWT = (refreshToken: string) => {
    return jwt.verify(refreshToken, JWT_REFRESH_KEY);
}