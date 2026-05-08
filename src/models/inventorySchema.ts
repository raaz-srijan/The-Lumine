import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IUnitDefinition {
    unit: string;
    factor: number; 
}

export interface IInventory extends Document {
    productId: string;
    name: string;
    stock: number; 
    price: number;
    unitDefinition: IUnitDefinition;
    minStock: number;
    isAvailable: boolean;
    category: Types.ObjectId;
    isDeleted: boolean;
    addedBy: Types.ObjectId;
    updatedBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const unitDefinitionSchema = new Schema<IUnitDefinition>(
    {
        unit: {
            type: String,
            required: true,
            trim: true,
        },
        factor: {
            type: Number,
            required: true,
            min: 0.000001,
        },
    },
    { _id: false }
);

const inventorySchema: Schema<IInventory> = new Schema(
    {
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

        unitDefinition: {
            type: unitDefinitionSchema,
            required: true,
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
    },
    { timestamps: true }
);

inventorySchema.index({ productId: 1, name: 1 });
inventorySchema.index({ category: 1, isDeleted: 1 });

export const Inventory: Model<IInventory> = mongoose.models.Inventory || mongoose.model<IInventory>("Inventory", inventorySchema);