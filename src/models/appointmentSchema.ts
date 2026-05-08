import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IAppointment extends Document {
    customerName: string;         
    customerPhone?: string;
    services: {
        serviceName: string;      
        price: number;           
    }[];
    staffId: Types.ObjectId;      
    totalAmount: number;
    appointmentDate: Date;       
    status: "pending" | "completed" | "cancelled";
    paymentStatus: "pending" | "paid";
    paymentMethod?: "cash" | "e-pay" ;
    notes?: string;               
    usedItems?: {
        productId: Types.ObjectId;
        quantityUsed: number; // in base units
    }[];
    addedBy: Types.ObjectId;    
    createdAt: Date;
    updatedAt: Date;
}

const appointmentSchema: Schema<IAppointment> = new Schema({
    customerName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    customerPhone: {
        type: String,
        trim: true,
    },
    services: [{
        serviceName: { type: String, required: true },
        price: { type: Number, required: true }
    }],
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true,
        default: 0,
    },
    appointmentDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "completed", "cancelled"],
        default: "pending",
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid"],
        default: "pending",
    },
    paymentMethod: {
        type: String,
        enum: ["cash", "e-pay"],
        default: "cash"
    },
    notes: {
        type: String,
        maxlength: 500,
    },
    usedItems: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Inventory" },
        quantityUsed: { type: Number, default: 0 }
    }],
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true });

appointmentSchema.index({ appointmentDate: 1, status: 1 });

export const Appointment: Model<IAppointment> =  mongoose.models.Appointment || mongoose.model<IAppointment>("Appointment", appointmentSchema);