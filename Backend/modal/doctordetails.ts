import mongoose, { Types } from "mongoose";

interface IDoctor{
    _id: Types.ObjectId;
    name:string;
    specialization:string;
    qualification:string;
    clinicAddress:string;
    clinicName:string;
    aboutDoctor:string;
    clinicOpeningTime:string;
    clinicClosingTime:string;
    clinicTimeZone?:string;
    createdby: Types.ObjectId;
    googleRefreshToken?: string | null;
    googleCalendarId?: string | null;
    appointmentDurationMinutes?: number;
    
}

const doctorSchema=new mongoose.Schema<IDoctor>({
name:{
    type:String,
    required:true,
},
specialization:{
    type:String,
   
},
qualification:{
    type:String,
    required:true,
},
clinicAddress:{
    type:String,
    required:true,
},

clinicName:{
    type:String,
    required:true,
},
aboutDoctor:{
    type:String,
    required:true,
},

clinicOpeningTime:{
    type:String,
    required:true,
},

clinicClosingTime:{
    type:String,
    required:true,
},

clinicTimeZone:{
    type:String,
    default: process.env.GOOGLE_CALENDAR_TIME_ZONE || "Asia/Kolkata",
},

googleRefreshToken:{
    type:String,
    default:null,
},

googleCalendarId:{
    type:String,
    default:"primary",
},

appointmentDurationMinutes:{
    type:Number,
    min:5,
    max:240,
    default:30,
},




}       )


export const Doctor=mongoose.model("Doctor",doctorSchema);
    
