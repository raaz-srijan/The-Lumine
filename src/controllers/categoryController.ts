import type { Request, Response } from "express";
import { Category } from "../models/categorySchema.js";

//ADD
export const addCat = async (req: Request, res: Response) => {
    try {
        const { name, description } = req.body;

        if (!name)
            return res.status(400).json({ success: false, message: "Please fill all the required fields" });

        const checkCat = await Category.findOne({ name: name.trim().toLowerCase() });

        if (checkCat)
            return res.status(409).json({ success: false, message: "Category with same name already exists" });

        const newCat = await Category.create({ name: name.trim().toLowerCase(), description: description.trim() });

        return res.status(201).json({ success: true, message: "Category added successfully", data: newCat });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

//UPDATE
export const updateCat = async (req: Request, res: Response) => {
    try {
        const { catId } = req.params;
        if (!catId)
            return res.status(404).json({ success: false, message: "Invalid category id" });

        const checkCat = await Category.findById(catId);

        if (!checkCat)
            return res.status(404).json({ success: false, message: "Category not found" });

        const { name, description } = req.body;

        const updateData: any = {};

        if (name) {
            const category = await Category.findOne({ name: name.trim().toLowerCase() });

            if (category && category._id.toString()! == checkCat._id.toString())
                return res.status(409).json({ success: false, message: "Category with same name already exists" });

            updateData.name = name.trim().toLowerCase();
        }

        if (description) updateData.description = description.trim();

        const updatedData = await Category.findByIdAndUpdate(catId, updateData, { new: true });

        return res.status(200).json({ success: true, message: "Category updated successfully", data: updatedData });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

//DELETE
export const deleteCat = async (req: Request, res: Response) => {
    try {
        const { catId } = req.params;
        if (!catId)
            return res.status(404).json({ success: false, message: "Invalid category id" });

        const checkCat = await Category.findByIdAndDelete(catId);
        if (!checkCat)
            return res.status(404).json({ success: false, message: "No category found" });

        return res.status(200).json({ success: true, message: "Category deleted successfully" });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

//FETCH
export const getCat = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 5;
        const skip = (page - 1) * limit;

        const [categories, total] = await Promise.all([
            Category.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
            Category.countDocuments()
        ]);

        return res.status(200).json({ 
            success: true, 
            message: "Categories fetched successfully", 
            data: categories,
            pagination: {
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                limit
            }
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

//FETCH-BY-ID
export const getCatById = async (req: Request, res: Response) => {
    try {
        const { catId } = req.params;
        if (!catId)
            return res.status(404).json({ success: false, message: "Invalid category id" });

        const category = await Category.findById(catId);

        if(!category)
            return res.status(404).json({success:false, message:"Category not found"});

        return res.status(200).json({success:true, message:"Category fetched successfully", data:category});

    } catch (error: any) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}
