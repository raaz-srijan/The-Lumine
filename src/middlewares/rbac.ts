import type { NextFunction, Request, Response } from "express";
import { Role } from "../models/roleSchema.js";

export const rbac = (requirement: string | string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userRoleName = req.user?.role?.toLowerCase();
      if (!userRoleName) {
        return res.status(403).json({
          success: false,
          message: "Access denied: No role assigned to user"
        });
      }

      if (userRoleName === "admin" || userRoleName === "owner") {
        return next();
      }

      if (Array.isArray(requirement)) {
        if (requirement.map(r => r.toLowerCase()).includes(userRoleName)) {
          return next();
        }
        return res.status(403).json({
          success: false,
          message: `Access denied: Role '${userRoleName}' is not authorized for this resource`
        });
      }

      const roleDoc = await Role.findOne({ name: userRoleName }).populate("permissions");
      
      if (!roleDoc) {
        return res.status(403).json({
          success: false,
          message: `Access denied: Role '${userRoleName}' not found in database. Please ensure database is seeded.`
        });
      }

      const hasPermission = (roleDoc.permissions as any[]).some(
        (p) => p.name === requirement
      );

      if (hasPermission) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: `Access denied: Role '${userRoleName}' lacks the required permission: '${requirement}'`
      });

    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Internal server error during authorization",
        error: error.message
      });
    }
  };
};
