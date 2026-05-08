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


// 3. Update Appointment (Mark as Completed/Paid)
export const updateAppointment = async (req: Request, res: Response) => {
    try {
        const { services, status, paymentStatus } = req.body;
        
        let updateData = { ...req.body };

        if (services) {
            updateData.totalAmount = services.reduce((acc: number, curr: any) => acc + curr.price, 0);
        }

        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!appointment) return res.status(404).json({ message: "Appointment not found" });
        res.status(200).json(appointment);
    } catch (error) {
        res.status(500).json({ message: "Update failed" });
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