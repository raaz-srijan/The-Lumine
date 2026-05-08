import type { Request, Response } from "express";
import { Role } from "../models/roleSchema.js";
import { Permission } from "../models/permissionSchema.js";

//ADD-ROLE
export const addRole = async(req:Request, res:Response) => {
    try {
        const {name, permissions} = req.body;

        if(!name || !permissions)
            return res.status(400).json({success:false, message:"Please fill all the required fields"});

        const existRole = await Role.findOne({name:name.trim().toLowerCase()});

        if(existRole)
            return res.status(409).json({success:false, message:"Role already existed"});

        const validPermissions = await Permission.find({_id:{$in:permissions}});

        if(validPermissions.length !== permissions.length)
            return res.status(400).json({success:false, message:"Permissions provided are invalid"});

        const newRole = await Role.create({name, permissions});

        return res.status(201).json({success:true, message:"Role created successfully", data:newRole});
    } catch (error: any) {
        return res.status(500).json({success:false, message:"Internal Server Error", error:error.message});
    }
}

//UPDATE-ROLE
export const updateRole = async(req:Request, res:Response) => {
    try {
        const {id} = req.params;

        if(!id)
            return res.status(404).json({success:false, message:"Invalid role"});

        const existRole = await Role.findById(id);

        if(!existRole)
            return res.status(404).json({success:false, message:"Role not found"});

        const {name, permissions} = req.body;

        const updateData: any = {};

        if(name) {
            const normalizedName = name.trim().toLowerCase();

            const checkRole = await Role.findOne({name: normalizedName, _id:{$ne: id}});

            if(checkRole)
                return res.status(400).json({success:false, message:"Role with same name already exists"});

            updateData.name = normalizedName;
        };

        if(permissions) {
            if(!Array.isArray(permissions))
                return res.status(400).json({success:false, message:"Permission must be an array "});

            const validPermissions = await Permission.find({_id:{$in:permissions}});

            if(validPermissions.length !== permissions.length)
                return res.status(400).json({success:false, message:"Permission ids are invalid"});

            updateData.permissions = permissions;
        }

        const updatedRole = await Role.findByIdAndUpdate(existRole._id, updateData, {new:true});

        return res.status(200).json({success:true, message:"Role updated successfully", data:updatedRole})
    } catch (error: any) {
        return res.status(500).json({success:false, message:"Internal Server Error", error:error.message});
    }
}

//DELETE-ROLE
export const deleteRole = async(req:Request, res:Response) => {
    try {
        const {id} = req.params;

        if(!id)
            return res.status(404).json({success:false, message:"Invalid id"});

        const existRole = await Role.findByIdAndDelete(id);

        if(!existRole)
            return res.status(404).json({success:false, message:"Role not found"});

        return res.status(200).json({success:true, message:"Role deleted successfully"});
    } catch (error: any) {
        return res.status(500).json({success:false, message:"Internal Server Error", error:error.message});    
    }
}

//FETCH-ROLES
export const getRoles = async(req:Request, res:Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 5;
        const skip = (page - 1) * limit;

        const [roles, total] = await Promise.all([
            Role.find().populate("permissions").skip(skip).limit(limit),
            Role.countDocuments()
        ]);

        return res.status(200).json({
            success:true,
            message:"Roles fetched successfully",
            data:roles,
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

//FETCH-ROlE-BY-ID
export const getRoleById = async(req:Request, res:Response) => {
    try {
        const {id} = req.params;

        if(!id)
            return res.status(404).json({success:false, message:"Invalid id"});

        const role = await Role.findById(id).populate("permissions");

        if(!role)
            return res.status(404).json({success:false, message:"Role not found"});

        return res.status(200).json({success:true,message:"Roles fetched successfully",data:role});
    } catch (error: any) {
        return res.status(500).json({success:false, message:"Internal Server Error", error:error.message});
    }
}
