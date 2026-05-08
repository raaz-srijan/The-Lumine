import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Inventory } from "../models/inventorySchema.js";
import { Category } from "../models/categorySchema.js";

//ADD-ITEMS
export const addItems = async(req:Request, res:Response) => {
    try {
        const {productId, productName, price, unit, category, physicalQuantity, itemSize, stock} = req.body;

        const size = Number(itemSize) || 1;
        let qty = 0;
        let totalStock = 0;

        if (physicalQuantity !== undefined) {
            qty = Number(physicalQuantity);
            totalStock = qty * size;
        } else if (stock !== undefined) {
            totalStock = Number(stock);
            qty = totalStock / size;
        }

        if(!productId || !productName || price === undefined || !unit || !category || (physicalQuantity === undefined && stock === undefined)) {
            return res.status(400).json({success:false, message:"Please fill all the required fields"});
        }

        const itemPrice = Number(price);

        const checkItems = await Inventory.findOne({productId: String(productId).trim().toUpperCase()});

        if(checkItems) {
            return res.status(409).json({success:false, message:"Item already existed"});
        }

        const checkCat = await Category.findOne({name: String(category || "").trim().toLowerCase()});

        if(!checkCat) {
            return res.status(404).json({success:false, message: "Category not found"});
        }

        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized user" });
        }

        const sanitizedProductId = String(productId || "").trim().toUpperCase();
        const sanitizedProductName = String(productName || "").trim();

        const newItem = new Inventory({
            productId: sanitizedProductId, 
            name: sanitizedProductName, 
            price: itemPrice, 
            stock: totalStock, 
            physicalQuantity: qty, 
            itemSize: size, 
            unit, 
            category: checkCat._id, 
            addedBy: userId
        });

        await newItem.save();
        return res.status(201).json({success:true, message:"Item added successfully", data:newItem});

        } catch (error: any) {
        console.error("Add Item Error Details:", {
            message: error.message,
            stack: error.stack,
            body: req.body
        });
        return res.status(500).json({success:false,message:"Internal Server Error", error:error.message});
    }
}


//UPDATE-ITEMS
export const updateItem = async(req:Request, res:Response) => {
    try {
        const {id} = req.params;

        if(!id)
            return res.status(404).json({success:false, message:"Invalid id"});

        const checkItem = await Inventory.findById(id);
        if(!checkItem)
            return res.status(404).json({success:false, message:"Item not found"});

        const {productId, productName, price, stock, physicalQuantity, itemSize, unit, category, isAvailable} = req.body;

        const updateData: any = {};

        if (productId) {
            const checkingItem = await Inventory.findOne({productId:productId.trim().toUpperCase()});

            if(checkingItem && checkingItem._id.toString() !== id)
                return res.status(409).json({success:false, message:"Item already existed"});

            updateData.productId = productId
        }

        if(productName) updateData.name = productName.trim();

        if(price !== undefined) updateData.price = price;
        
        let newSize = itemSize !== undefined ? Number(itemSize) : checkItem.itemSize;
        if (physicalQuantity !== undefined) {
            const pQty = Number(physicalQuantity);
            updateData.physicalQuantity = pQty;
            updateData.stock = pQty * newSize;
        } else if (stock !== undefined) {
            const sVal = Number(stock);
            updateData.stock = sVal;
            updateData.physicalQuantity = sVal / newSize;
        }
        
        if(itemSize !== undefined) updateData.itemSize = Number(itemSize);

        if(price !== undefined) updateData.price = Number(price);

        if(unit) updateData.unit = unit;

        if(category) {
            const checkCat = await Category.findOne({name:category.trim().toLowerCase()});

            if(!checkCat)
                return res.status(404).json({success:false, message:"Category not found"});

            updateData.category = checkCat._id;
        }

        if(isAvailable !== undefined) updateData.isAvailable = isAvailable;

        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized user" });
        }
        updateData.updatedBy = userId;

        const updatedData = await Inventory.findByIdAndUpdate(id, updateData, {new:true});

        return res.status(200).json({success:true, message:"Item updated successfully", data:updatedData});
        
    } catch (error: any) {
        return res.status(500).json({success:false, message:"Internal Server Error", error:error.message});
    }
}


//DELETE-ITEM
export const deleteItem = async(req:Request, res:Response) => {
    try {
        const {id} = req.params;
        if(!id)
            return res.status(404).json({success:false,message:"Invalid id"});

        const deleteItem = await Inventory.findByIdAndUpdate(id, {isAvailable:false, isDeleted:true, deletedAt:new Date()}, {new:true});

        if(!deleteItem)
            return res.status(404).json({success:false, message:"Item not found"});

        return res.status(200).json({success:true, message:"Item deleted successfully"});
    } catch (error: any) {
        return res.status(500).json({success:false, message:"Internal Server Error", error:error.message});
    }
}


//FETCH-ITEM-By-ID
export const fetchItemById = async(req:Request, res:Response) => {
    try {
        const {id} =req.params;
        if(!id)
            return res.status(404).json({success:false, message:"Invalid id"});

        const item = await Inventory.findOne({_id:id, isDeleted:{$ne:true}});
        
        if(!item)
            return res.status(404).json({success:false,message:"Item not found"});

        return res.status(200).json({success:true, message:"Item fetched successfully", data:item});
    } catch (error: any) {
        return res.status(500).json({success:false, message:"Internal Server Error", error:error.message});
    }
}


//FETCH-ITEMS
export const fetchItems = async(req:Request, res:Response) => {
    try {
        const {page = 1, limit = 5, search, category} =req.query;

        const query: any = {isDeleted:false};

        if(search) query.name = {$regex: search, $options: "i"};

        if(category && mongoose.Types.ObjectId.isValid(category as string)) {
            query.category = category;
        }

        const items = await Inventory.find(query)
            .populate("category", "name")
            .sort({createdAt:-1})
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        if(!items)
            return res.status(404).json({success:false, message:"No items found"});

        const total = await Inventory.countDocuments(query);

        return res.status(200).json({
            success:true, 
            message:"Items fetched successfully", 
            data:items, 
            pagination:{
                page: Number(page), 
                limit: Number(limit), 
                totalPages: Math.ceil(total/Number(limit))
            }
        });
    } catch (error : any) {
        console.error("Fetch Items Error:", error);
        return res.status(500).json({success:false, message:"Internal Server Error", error:error.message});
    }
}