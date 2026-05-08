import {  type Request, type Response } from "express";
import { User } from "../models/userSchema.js";
import bcrypt from "bcrypt";
import { Role } from "../models/roleSchema.js";
import { generateJWT, generateRefreshJWT, verifyJWT, verifyRefreshJWT, type PayloadType } from "../utils/generateToken.js";
import { passwordChanged, requestApproved, userRevoked, userRoleAssigned, verifyRegisterEmail } from "../utils/sendMail.js";

// REFRESH TOKEN
export const refreshToken = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ success: false, message: "Refresh token required" });
        }

        let decoded: PayloadType;
        try {
            decoded = verifyRefreshJWT(refreshToken) as PayloadType;
        } catch (err) {
            return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
        }

        const user = await User.findById(decoded.id).populate("roleId");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (!user.isApproved) {
            return res.status(403).json({ success: false, message: "Account is no longer approved" });
        }

        const token = generateJWT({ id: user._id.toString(), role: (user.roleId as any).name });
        const newRefreshToken = generateRefreshJWT({ id: user._id.toString() });

        return res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
            data: { token, refreshToken: newRefreshToken }
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

//REGISTER
export const register = async(req:Request, res:Response) => {
    try {
        const {name, email, phone, password} = req.body;

        if(!name || !email || !phone || !password)
            return res.status(400).json({success:false, message:"Please fill all the required fields"});

        const existUser = await User.findOne({email:email.toLowerCase().trim()});

        if(existUser)
            return res.status(409).json({success:false, message:"Email is already registered"});

        const hashedPassword = await bcrypt.hash(password, 12);

        const defaultRole = await Role.findOne({name:"staff"});

        if(!defaultRole)
            return res.status(404).json({success:false, message:"Invalid role"});

        const newUser = await User.create({name, email, phone, password:hashedPassword, roleId:defaultRole._id});

        const token = generateJWT({id: newUser._id.toString(), email:newUser.email});
        await verifyRegisterEmail(newUser.email, token);

        return res.status(201).json({success:true, message:"User registered successfully", data:token});
        
    } catch (error: any) {
        return res.status(500).json({success:false, message:"Internal Server Error", error:error.message});
    }
}



//LOGIN
export const login = async(req:Request, res:Response) => {
    try {
        const {email, password} = req.body;

        if(!email || !password)
            return res.status(404).json({success:false, message:"Please fill all the required fields"});

        const existUser = await User.findOne({email:email.toLowerCase().trim()}).populate('roleId').select("+password");

        if(!existUser)
            return res.status(404).json({success:false, message:"Incorrect email or password"});

        const isMatch = await bcrypt.compare(password, existUser.password);

        if(!isMatch)
            return res.status(400).json({success:false, message:"Incorrect email or password"});

        if(!existUser.isVerified)
            return res.status(401).json({success:false, message:"Email is not verified. Please verify before login"});

        if(!existUser.isApproved)
            return res.status(403).json({success:false, message:"User is not approved. Please contact the admin for more info"});

        const token = generateJWT({id:existUser._id.toString(), role: (existUser.roleId as any).name});
        const refreshToken = generateRefreshJWT({id:existUser._id.toString()})

        return res.status(200).json({success:true, message:"Login successfully", data:{token,refreshToken, id:existUser._id, name:existUser.name, email:existUser.email, phone:existUser.phone, role:existUser.roleId, isApproved:existUser.isApproved, isVerified:existUser.isVerified}});
    } catch (error: any) {
        return res.status(500).json({success:false,message:"Internal Server Error", error:error.message});
    }
}


//APPROVAL (ADMIN)
export const approvalRequest = async(req:Request, res:Response) => {
    try {
        const {id} = req.params;

        if(!id)
            return res.status(404).json({success:false, message:"Invalid id"});

        const findUser = await User.findById(id);
        
        if(!findUser)
            return res.status(404).json({success:false, message:"User not found"});

        if(findUser.isApproved)
            return res.status(400).json({success:false, message:"User is already approved"});

        findUser.isApproved = true;

        await findUser.save();

        await requestApproved(findUser.email);

        return res.status(200).json({success:true, message:"User approved successfully", data:findUser});
    } catch (error: any) {
        return res.status(500).json({success:false, message:"Internal Server Error", error:error.message});
    }
}


//REVOKE-APPROVAL & AUTHORITY
export const revokeAuthority = async(req:Request, res:Response) => {
    try {
        const {id} = req.params;

        if(!id)
            return res.status(404).json({success:false, message:"Invalid id"});

        const user = await User.findById(id).populate("roleId");

        if(!user)
            return res.status(404).json({success:false, message:"User not found"});

        if(id === req.user?.id?.toString())
            return res.status(403).json({success:false, message:"You cannot revoke your own authority"});

        if(!user.isApproved)
            return res.status(400).json({success:false, message:"User is already revoked"});

        user.set('roleId', null);
        user.isApproved = false;

        await user.save();

        await userRevoked(user.email, user.name);

        return res.status(200).json({success:true, message:"Revoke authority successfully", data:{id:user._id, name:user.name, email:user.email, role:user.roleId, isApproved:user.isApproved}});
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({success:false, message:"Internal Server Error", error:error.message});
    }
}


//ASSIGN-ROLES
export const assignRole = async(req:Request, res:Response) => {
    try {
        const {id} = req.params;

        if(!id)
            return res.status(404).json({success:false, message:"Invalid id"});

        const user = await User.findById(id).populate("roleId");

        if(!user)
            return res.status(404).json({success:false, message:"User not found"});

        if(id === req.user.id?.toString())
            return res.status(403).json({success:false, message:"You cannot change your own role"});

        const {role} = req.body;

        const roleExists = await Role.findById(role);

        if(!roleExists)
            return res.status(404).json({success:false, message:"Invalid role"});

        const updatedUser = await User.findByIdAndUpdate(
            id, 
            { roleId: role, isApproved: true }, 
            { new: true }
        ).populate("roleId");

        if (!updatedUser) {
            return res.status(500).json({ success: false, message: "Update failed" });
        }

        await userRoleAssigned(updatedUser.email, updatedUser.name, (updatedUser.roleId as any)?.name) 

        return res.status(200).json({
            success: true, 
            message: `User ${updatedUser.name} assigned to role: ${roleExists.name}`, 
            data: updatedUser
        });

    } catch (error: any) {
        return res.status(500).json({success:false, message:"Internal Server Error", error:error.message});
    }
}

//UPDATE-OWN-DETAILS
export const updateMe = async (req: Request, res: Response) => {
    try {
        if (!req.user)
            return res.status(403).json({ success: false, message: "Authentication required" });

        const userId = req.user.id;
        const user = await User.findById(userId).select("+password");

        if (!user)
            return res.status(404).json({ success: false, message: "Guest registry not found" });

        const { name, email, oldPassword, newPassword, phone } = req.body;
        
        let needReapproval = false;
        const updateData: any = {};

        if (email && email.toLowerCase().trim() !== user.email) {
            const emailExists = await User.findOne({ email: email.toLowerCase().trim() });
            if (emailExists)
                return res.status(400).json({ success: false, message: "Email is already associated with another account" });

            updateData.email = email.toLowerCase().trim();
            needReapproval = true; 
        }

        if (newPassword) {
            if (!oldPassword) {
                return res.status(400).json({ success: false, message: "Current password is required to authorize this change" });
            }
            
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: "The current password provided is incorrect" });
            }

            updateData.password = await bcrypt.hash(newPassword, 12);
        }

        if (name) updateData.name = name.trim();
        if (phone) updateData.phone = phone.trim();

        if (needReapproval) updateData.isApproved = false;

        if (newPassword) {
            const recipientEmail = updateData.email || user.email;
            const recipientName = updateData.name || user.name;
            
            passwordChanged(recipientEmail, recipientName).catch(err => 
                console.error("Lumine Security Mailer Error:", err)
            );
        }

        const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true });

        return res.status(200).json({
            success: true, 
            message: needReapproval 
                ? "Profile updated. Due to sensitive changes, your account is pending re-approval." 
                : "Your profile has been elegantly updated.", 
            data: updatedUser
        });

    } catch (error: any) {
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error", 
            error: error.message 
        });
    }
}

// VERIFY-EMAIL
export const verifyEmail = async (req: Request<{ token: string }>, res: Response) => {
    try {
        const { token } = req.params;
        if (!token)
            return res.status(404).json({ success: false, message: "Invalid or expired token" });

        let decoded: {id:string};

        try {
            decoded = verifyJWT(token) as {id:string};

        } catch (error) {
            return res.status(403).json({ success: false, message: "Invalid or expired token" });
        }

        const user = await User.findById(decoded.id);

        if (!user)
            return res.status(404).json({ success: false, message: "User not found" });

        if (user.isVerified)
            return res.status(400).json({ success: false, message: "Email already verified" });

        user.isVerified = true;
        await user.save();

        return res.status(200).json({ success: true, message: "Email verified successfully" });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });

    }
}

//APPROVED-STAFF
export const getApprovedStaff = async (req: Request, res: Response) => {
    try {
        const staff = await User.find({ isApproved: true })
            .select("name _id email")
            .sort({ name: 1 });
            
        return res.status(200).json({
            success: true,
            data: staff
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: "Error fetching approved staff", error: error.message });
    }
};

//USERS
export const getUsers = async(req:Request, res:Response) => {
    try {
        if(!req.user.id)
            return res.status(403).json({success:false, message:"Please login"});
        
        const userId = req.user?.id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 5;
        const skip = (page - 1) * limit;

        const [users, totalUsers] = await Promise.all([
            User.find({ _id: { $ne: userId } })
                .populate("roleId")
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            User.countDocuments({ _id: { $ne: userId } })
        ]);
        
        return res.status(200).json({
            success: true, 
            message: "Users fetched successfully",
            data: users.map(user => ({ 
                _id: user._id,
                name: user.name, 
                email: user.email, 
                phone: user.phone, 
                roleId: user.roleId, 
                isApproved: user.isApproved 
            })),
            pagination: {
                totalUsers,
                totalPages: Math.ceil(totalUsers / limit),
                currentPage: page,
                limit
            }
        });
    } catch (error: any) {
        return res.status(500).json({success:false, message:"Internal Server Error", error:error.message});
    }
}
