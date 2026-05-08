import type { NextFunction, Request, Response } from "express";
import { generateJWT, verifyJWT, verifyRefreshJWT, type PayloadType } from "../utils/generateToken.js";
import { User } from "../models/userSchema.js";

export const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer")) 
            return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });

        const token = authHeader.split(" ")[1];

        if (!token)
            return res.status(401).json({ success: false, message: "Unauthorized: Invalid token format" });

        try {
            const decoded = verifyJWT(token) as PayloadType;

            const currentUser = await User.findById(decoded.id);
            if (!currentUser || !currentUser.isApproved || currentUser.roleId === null) {
                return res.status(401).json({ 
                    success: false, 
                    message: "Authority revoked. Please contact admin." 
                });
            }

            req.user = decoded;
            next();
        } catch (error: any) {
            if (error.name === "TokenExpiredError") {
                const refreshToken = req.headers["x-refresh-token"] as string;

                if (!refreshToken) {
                    return res.status(401).json({ success: false, message: "Access token expired. No refresh token provided." });
                }

                try {
                    const decodedRefresh = verifyRefreshJWT(refreshToken) as PayloadType;
                    
                    const currentUser = await User.findById(decodedRefresh.id);
                    if (!currentUser || !currentUser.isApproved || currentUser.roleId === null) {
                        return res.status(401).json({ 
                            success: false, 
                            message: "Session invalidated. Authority revoked." 
                        });
                    }

                    const newAccessToken = generateJWT({ id: decodedRefresh.id });
                    res.setHeader("x-new-access-token", newAccessToken);

                    req.user = decodedRefresh;
                    next();
                } catch (refreshError: any) {
                    return res.status(401).json({ success: false, message: "Session expired. Please login again." });
                }
            } else {
                return res.status(401).json({ success: false, message: "Invalid token", error: error.message });
            }
        }
    } catch (error: any) {
        return res.status(500).json({ success: false, message: "Server error during authentication", error: error.message });
    }
};