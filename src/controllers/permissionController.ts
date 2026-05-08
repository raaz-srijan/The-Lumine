import type { Request, Response } from "express";
import { Permission } from "../models/permissionSchema.js";

//ADD
export const addPermission = async(req:Request, res:Response) => {
    try {
        const {name, group} = req.body;

        if(!name || !group)
            return res.status(400).json({success:false, message:"Please fill all the required fields"});

        const existPerm = await Permission.findOne({name:name.toLowerCase().trim()});

        if(existPerm)
            return res.status(409).json({success:false, message:"Permission with the same name already existed"});

        const newPerm = await Permission.create({name, group});

        return res.status(201).json({success:true, message:"Permission created succcessfully", data:newPerm});
    } catch (error: any) {
        return res.status(500).json({success:false, message:"Internal Server Error", error:error.message});
    }
}

//UPDATE
export const updatePermission = async(req:Request, res:Response) => {
    try {
        const {id} = req.params;

        if(!id)
            return res.status(404).json({success:false, message:"Invalid id"});

        const checkPerm = await Permission.findById(id);

        if(!checkPerm)
            return res.status(404).json({success:false, message:"Permission not found"});

        const {name, group} = req.body;


        const updateData: any = {};

        if(name) {
            const normalizedName = name.trim().toLowerCase();

            const checkName = await Permission.findOne({name:normalizedName, _id: {$ne:id}});

            if(checkName)
                return res.status(409).json({success:false, message:"Permission name already exists"});

            updateData.name = normalizedName;
        }

        if(group) updateData.group = group;

        const updatePerm = await Permission.findByIdAndUpdate(checkPerm._id, updateData, {new:true});

        return res.status(200).json({success:true, message:"Permission updated successfully", data:updatePerm});
    } catch (error: any) {
        return res.status(500).json({successs:false, message:"Internal Server Error", error:error.message});
    }
}

//DELETE
export const deletePermission = async(req:Request, res:Response) => {
    try {
        const {id} = req.params;

        if(!id)
            return res.status(404).json({success:false, message:"Invalid id"});

        const perm = await Permission.findByIdAndDelete(id);

        if(!perm)
            return res.status(404).json({success:false, message:"Permission not found"});

        return res.status(200).json({success:true, message:"Permission deleted successfully"});
    } catch (error: any) {
        return res.status(500).json({success:false, message:"Internal Server Error", error:error.message});
    }
}

//FETCH
export const getPermissions = async(req:Request, res:Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 5;
        const skip = (page - 1) * limit;

        const [permissions, total] = await Promise.all([
            Permission.find().skip(skip).limit(limit),
            Permission.countDocuments()
        ]);

        return res.status(200).json({
            success: true, 
            message: "Permissions fetched successfully", 
            data: permissions,
            pagination: {
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                limit
            }
        });
    } catch (error: any) {
        return res.status(500).json({success:false, message:"Internal Server Error", error:error.message});
    }
}

//FETCH-BY-ID
export const getPermissionById = async(req:Request, res:Response) => {
    try {
        const {id} = req.params;

        if(!id)
            return res.status(404).json({success:false, message:"Invalid id"});

        const permission = await Permission.findById(id);

        if(!permission)
            return res.status(404).json({success:false, message:"Permission not found"});

        return res.status(200).json({success:true, message:"Permission fetched successfully", data:permission});
    } catch (error: any) {
        return res.status(500).json({success:false, message:"Internal Server Error", error:error.message});
    }
}