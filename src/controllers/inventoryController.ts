import type { Request, Response } from "express";
import { Inventory } from "../models/inventorySchema.js";
import { Category } from "../models/categorySchema.js";
import { fromBaseStock, toBaseStock } from "../utils/unitConversion.js";
import mongoose from "mongoose";

// ADD ITEM
export const addItems = async (req: Request, res: Response) => {
    try {
        const {
            productId,
            productName,
            price,
            category,
            physicalQuantity,
            itemSize,
            unit,
            isAvailable = true,
        } = req.body;

        if (
            !productId ||
            !productName ||
            price === undefined ||
            !category ||
            physicalQuantity === undefined ||
            itemSize === undefined ||
            !unit
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields",
            });
        }

        const checkItem = await Inventory.findOne({
            productId: productId.trim().toUpperCase(),
            isDeleted: false,
        });

        if (checkItem) {
            return res.status(409).json({
                success: false,
                message: "Product ID already registered",
            });
        }

        // Try finding category by ID first, then by name (flexibility)
        let checkCat;
        if (mongoose.Types.ObjectId.isValid(category)) {
            checkCat = await Category.findById(category);
        } else {
            checkCat = await Category.findOne({
                name: String(category).trim().toLowerCase(),
            });
        }

        if (!checkCat) {
            return res.status(404).json({
                success: false,
                message: "Invalid category mapping",
            });
        }

        const userId = req.user?.id!;
        const factor = Number(itemSize);
        const qty = Number(physicalQuantity);
        const baseStock = toBaseStock(qty, factor);

        const newItem = await Inventory.create({
            productId: productId.trim().toUpperCase(),
            name: productName.trim().toLowerCase(),
            price: Number(price),
            stock: baseStock,
            unitDefinition: {
                unit: unit.trim().toLowerCase(),
                factor,
            },
            category: checkCat._id,
            addedBy: userId,
            isAvailable,
        });

        return res.status(201).json({
            success: true,
            message: "Stock asset registered successfully",
            data: newItem,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

// UPDATE ITEM
export const updateItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const item = await Inventory.findById(id);

        if (!item || item.isDeleted) {
            return res.status(404).json({ success: false, message: "Inventory item not found" });
        }

        const {
            productId,
            productName,
            price,
            physicalQuantity,
            itemSize,
            unit,
            category,
            isAvailable,
            minStock
        } = req.body;

        const updateData: any = {};

        if (productId) {
            const exists = await Inventory.findOne({
                productId: productId.trim().toUpperCase(),
                isDeleted: false,
                _id: { $ne: new mongoose.Types.ObjectId(id as string) }
            });
            if (exists) return res.status(409).json({ success: false, message: "SKU already in use" });
            updateData.productId = productId.trim().toUpperCase();
        }

        if (productName) updateData.name = productName.trim().toLowerCase();
        if (price !== undefined) updateData.price = Number(price);
        if (minStock !== undefined) updateData.minStock = Number(minStock);
        if (isAvailable !== undefined) updateData.isAvailable = isAvailable;

        // Recalculate stock if units or quantity changes
        const currentFactor = itemSize !== undefined ? Number(itemSize) : item.unitDefinition.factor;
        const currentQty = physicalQuantity !== undefined ? Number(physicalQuantity) : fromBaseStock(item.stock, item.unitDefinition.factor);
        
        if (itemSize !== undefined || physicalQuantity !== undefined) {
            updateData.stock = toBaseStock(currentQty, currentFactor);
        }

        if (unit || itemSize !== undefined) {
            updateData.unitDefinition = {
                unit: unit ? unit.trim().toLowerCase() : item.unitDefinition.unit,
                factor: currentFactor
            };
        }

        if (category) {
            let checkCat;
            if (mongoose.Types.ObjectId.isValid(category)) {
                checkCat = await Category.findById(category);
            } else {
                checkCat = await Category.findOne({ name: category.trim().toLowerCase() });
            }
            if (checkCat) updateData.category = checkCat._id;
        }

        updateData.updatedBy = req.user?.id;

        const updated = await Inventory.findByIdAndUpdate(id, { $set: updateData }, { new: true }).populate("category", "name");

        return res.status(200).json({
            success: true,
            message: "Inventory record updated",
            data: updated,
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

// DELETE ITEM (SOFT)
export const deleteItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deleted = await Inventory.findByIdAndUpdate(id, { isAvailable: false, isDeleted: true }, { new: true });

        if (!deleted) return res.status(404).json({ success: false, message: "Item not found" });

        return res.status(200).json({ success: true, message: "Item removed from active inventory" });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

// FETCH SINGLE
export const fetchItemById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid item ID" });
        }
        const item = await Inventory.findOne({ _id: new mongoose.Types.ObjectId(id), isDeleted: false }).populate("category", "name");

        if (!item) return res.status(404).json({ success: false, message: "Item not found" });

        const data = {
            ...item.toObject(),
            displayQuantity: fromBaseStock(item.stock, item.unitDefinition.factor),
        };

        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

// FETCH ALL (WITH PAGINATION & SEARCH)
export const fetchItems = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10, search, category } = req.query;
        const query: any = { isDeleted: false };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { productId: { $regex: search, $options: "i" } }
            ];
        }

        if (category) query.category = category;

        const items = await Inventory.find(query)
            .populate("category", "name")
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        const enriched = items.map((item) => ({
            ...item.toObject(),
            displayQuantity: fromBaseStock(item.stock, item.unitDefinition.factor),
        }));

        const total = await Inventory.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: enriched,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                totalItems: total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

// INVENTORY STATS
export const getInventoryStats = async (req: Request, res: Response) => {
    try {
        const stats = await Inventory.aggregate([
            { $match: { isDeleted: false } },
            {
                $group: {
                    _id: null,
                    totalItems: { $sum: 1 },
                    totalStockValue: { $sum: { $multiply: ["$stock", "$price"] } },
                    lowStockAlerts: {
                        $sum: {
                            $cond: [{ $lte: ["$stock", "$minStock"] }, 1, 0]
                        }
                    },
                    outOfStock: {
                        $sum: {
                            $cond: [{ $eq: ["$stock", 0] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        const result = stats[0] || {
            totalItems: 0,
            totalStockValue: 0,
            lowStockAlerts: 0,
            outOfStock: 0
        };

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: "Error fetching inventory stats", error: error.message });
    }
};