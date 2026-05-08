import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IUser extends Document {
    name:string;
    email:string;
    password:string;
    phone:string;
    roleId:Types.ObjectId;
    isVerified:boolean;
    isApproved:boolean;
    createdAt:Date;
    updatedAt:Date;
}

const userSchema:Schema<IUser> = new Schema({
    name:{
        type:String,
        required:true,
        trim:true,
    },

    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },

    password:{
        type:String,
        minlength:6,
        select:false,
        required:true,
    },

    phone:{
        type:String,
        trim:true,
        required:true,
    },

    isVerified:{
        type:Boolean,
        default:false,
        required:true,
    },

    isApproved:{
        type:Boolean,
        default:false,
        required:true,
    },

    roleId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Role",
        default:null,
    }
}, {timestamps:true});

export const User:Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", userSchema);