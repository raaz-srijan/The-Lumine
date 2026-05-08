import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IInventory extends Document {
    productId: string;
    name: string;
    stock: number;         
    price: number;         
    unit: string;          
    itemSize: string;     
    physicalQuantity: number; 
    minStock: number;     
    isAvailable: boolean;
    category: Types.ObjectId;
    isDeleted: boolean;
    addedBy: Types.ObjectId;
    updatedBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const inventorySchema: Schema<IInventory> = new Schema({
    productId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    stock: {
        type: Number,
        default: 0,
        min: 0,
    },
    price: {
        type: Number,
        required: true,
        default: 0,
    },
    unit: {
        type: String,
        required: true,
        enum: ["ml", "oz", "pcs", "box", "bottle"], 
        default: "pcs",
    },
    itemSize: {
        type: String,
        trim: true,
    },
    physicalQuantity: {
        type: Number,
        default: 0,
    },
    minStock: {
        type: Number,
        default: 5, 
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category", 
        required: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
}, { timestamps: true });

inventorySchema.index({ productId: 1, name: 1 });

export const Inventory: Model<IInventory> =  mongoose.models.Inventory || mongoose.model<IInventory>("Inventory", inventorySchema);