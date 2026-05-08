import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICategory extends Document {
    name:string;
    description?:string;
    createdAt:Date;
    updatedAt:Date;
};

const categorySchema:Schema <ICategory> = new Schema({
    name:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
    },

    description:{
        type:String,
        maxlength:2000
    },
}, {timestamps:true});


export const Category:Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>("Category", categorySchema);