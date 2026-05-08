import type { Request, Response } from "express";
import { Appointment } from "../models/appointmentSchema.js";

export const getAppointmentStats = async (req: Request, res: Response) => {
    try {
        const [
            total,
            pending,
            completed,
            cancelled,
            revenueData
        ] = await Promise.all([
            Appointment.countDocuments(),
            Appointment.countDocuments({ status: "pending" }),
            Appointment.countDocuments({ status: "completed" }),
            Appointment.countDocuments({ status: "cancelled" }),
            Appointment.aggregate([
                { $match: { paymentStatus: "paid" } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } }
            ])
        ]);

        const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

        res.status(200).json({
            success: true,
            data: {
                total,
                pending,
                completed,
                cancelled,
                totalRevenue
            }
        });
    } catch (error: any) {
        res.status(500).json({ message: "Error fetching appointment stats", error: error.message });
    }
};

// 1. Create Appointment (Manual Entry)
export const createAppointment = async (req: Request, res: Response) => {
    try {
        const { services } = req.body;

        const totalAmount = services.reduce((acc: number, curr: any) => acc + curr.price, 0);

        const appointment = new Appointment({
            ...req.body,
            totalAmount,
            addedBy: req.user._id, 
        });

        await appointment.save();
        res.status(201).json(appointment);
    } catch (error: any) {
        res.status(500).json({ message: "Error creating appointment", error: error.message });
    }
};

// 2. Get Appointments (with Filters)
export const getAppointments = async (req: Request, res: Response) => {
    try {
        const { date, status, page = 1, limit = 5 } = req.query;
        let query: any = {};

        if (date) {
            const start = new Date(date as string);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date as string);
            end.setHours(23, 59, 59, 999);
            query.appointmentDate = { $gte: start, $lte: end };
        }

        if (status) query.status = status;

        const skip = (Number(page) - 1) * Number(limit);

        const [appointments, total] = await Promise.all([
            Appointment.find(query)
                .populate("staffId", "name") 
                .populate("addedBy", "name")
                .sort({ appointmentDate: 1 })
                .skip(skip)
                .limit(Number(limit)),
            Appointment.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            data: appointments,
            pagination: {
                total,
                totalPages: Math.ceil(total / Number(limit)),
                currentPage: Number(page),
                limit: Number(limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching appointments" });
    }
};


import { Inventory } from "../models/inventorySchema.js";

// 3. Update Appointment (Mark as Completed/Paid + Deduct Stock)
export const updateAppointment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { services, status, usedItems } = req.body;
        
        const existingAppointment = await Appointment.findById(id);
        if (!existingAppointment) return res.status(404).json({ message: "Appointment not found" });

        // If status is changing to 'completed', and it wasn't already completed
        if (status === "completed" && existingAppointment.status !== "completed") {
            const itemsToDeduct = usedItems || existingAppointment.usedItems || [];
            
            if (itemsToDeduct.length > 0) {
                // Deduct stock for each item
                for (const item of itemsToDeduct) {
                    const product = await Inventory.findById(item.productId);
                    if (product) {
                        if (product.stock < item.quantityUsed) {
                            return res.status(400).json({ 
                                success: false, 
                                message: `Insufficient stock for ${product.name}. Required: ${item.quantityUsed}, Available: ${product.stock}` 
                            });
                        }
                        product.stock -= item.quantityUsed;
                        await product.save();
                    }
                }
            }
        }

        let updateData = { ...req.body };

        if (services) {
            updateData.totalAmount = services.reduce((acc: number, curr: any) => acc + curr.price, 0);
        }

        const appointment = await Appointment.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: "Appointment updated and inventory adjusted",
            data: appointment
        });
    } catch (error: any) {
        res.status(500).json({ message: "Update failed", error: error.message });
    }
};

// 4. Delete Appointment
export const deleteAppointment = async (req: Request, res: Response) => {
    try {
        const appointment = await Appointment.findByIdAndDelete(req.params.id);
        if (!appointment) return res.status(404).json({ message: "Appointment not found" });
        res.status(200).json({ message: "Appointment deleted" });
    } catch (error) {
        res.status(500).json({ message: "Delete failed" });
    }
};