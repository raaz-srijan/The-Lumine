import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Inventory } from "../models/inventorySchema.js";
import { Appointment } from "../models/appointmentSchema.js";
import { User } from "../models/userSchema.js";
import { Category } from "../models/categorySchema.js";

export const getAdminDashboardStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    const [
      totalInventory,
      lowStockItems,
      totalAppointments,
      totalCategories,
      totalStaff,
      recentAppointments,
      revenueData,
      weeklyRevenue,
      statusDistribution,
      staffPerformance,
      categoryDistribution
    ] = await Promise.all([
      Inventory.countDocuments({ isDeleted: false }),
      Inventory.countDocuments({ isDeleted: false, $expr: { $lte: ["$stock", "$minStock"] } }),
      Appointment.countDocuments(),
      Category.countDocuments(),
      User.countDocuments({ _id: { $ne: userId } }),
      Appointment.find()
        .sort({ appointmentDate: -1 })
        .limit(5)
        .populate("staffId", "name"),
      Appointment.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]),
      Appointment.aggregate([
        {
          $match: {
            paymentStatus: "paid",
            appointmentDate: { $gte: sevenDaysAgo }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate" } },
            amount: { $sum: "$totalAmount" }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Appointment.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]),
      Appointment.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: "$staffId", totalRevenue: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
        { $sort: { totalRevenue: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "staff"
          }
        },
        { $unwind: "$staff" },
        { $project: { name: "$staff.name", totalRevenue: 1, count: 1 } }
      ]),
      Inventory.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id",
            as: "cat"
          }
        },
        { $unwind: "$cat" },
        { $project: { name: "$cat.name", count: 1 } }
      ])
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          inventory: {
            total: totalInventory,
            lowStock: lowStockItems,
            categoryDistribution
          },
          appointments: {
            total: totalAppointments,
            recent: recentAppointments,
            weeklyRevenue,
            statusDistribution,
            staffPerformance
          },
          categories: totalCategories,
          staff: totalStaff,
          revenue: totalRevenue
        }
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error fetching dashboard statistics",
      error: error.message
    });
  }
};

export const getStaffDashboardStats = async (req: Request, res: Response) => {
  try {
    const rawUserId = req.user?.id;

    if (!rawUserId) 
        return res.status(401).json({success: false, message: "Unauthorized user",});
      
    const userId = new mongoose.Types.ObjectId(rawUserId);
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    const [
      totalAppointments,
      todayAppointments,
      recentAppointments,
      revenueData,
      weeklyRevenue,
      statusDistribution,
      topServices,
      inventoryCount
    ] = await Promise.all([
      Appointment.countDocuments({ staffId: userId }),
      Appointment.countDocuments({ 
        staffId: userId, 
        appointmentDate: { $gte: startOfToday, $lte: endOfToday } 
      }),
      Appointment.find({ staffId: userId })
        .sort({ appointmentDate: -1 })
        .limit(5)
        .populate("staffId", "name"),
      Appointment.aggregate([
        { $match: { staffId: userId, paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]),
      Appointment.aggregate([
        {
          $match: {
            staffId: userId,
            paymentStatus: "paid",
            appointmentDate: { $gte: sevenDaysAgo }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate" } },
            amount: { $sum: "$totalAmount" }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Appointment.aggregate([
        { $match: { staffId: userId } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]),
      Appointment.aggregate([
        { $match: { staffId: userId } },
        { $unwind: "$services" },
        { $group: { _id: "$services.serviceName", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 3 }
      ]),
      Inventory.countDocuments({ addedBy: userId, isDeleted: false })
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;
    
    const completed = statusDistribution.find(d => d._id === "completed")?.count || 0;
    const cancelled = statusDistribution.find(d => d._id === "cancelled")?.count || 0;
    const completionRate = totalAppointments > 0 ? Math.round((completed / totalAppointments) * 100) : 0;

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          appointments: {
            total: totalAppointments,
            today: todayAppointments,
            completed,
            cancelled,
            completionRate,
            recent: recentAppointments,
            weeklyRevenue,
            statusDistribution,
            topServices
          },
          inventory: {
            managed: inventoryCount
          },
          revenue: totalRevenue
        }
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error fetching staff dashboard statistics",
      error: error.message
    });
  }
};

export const getDashboardStats = async (req: Request, res: Response) => {
  const role = req.user?.role;
  if (role === "admin" || role === "owner") {
    return getAdminDashboardStats(req, res);
  }
  return getStaffDashboardStats(req, res);
};
