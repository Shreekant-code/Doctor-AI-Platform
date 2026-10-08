import mongoose from "mongoose";
const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    specialization: {
        type: String,
    },
    qualification: {
        type: String,
        required: true,
    },
    clinicAddress: {
        type: String,
        required: true,
    },
    clinicName: {
        type: String,
        required: true,
    },
    aboutDoctor: {
        type: String,
        required: true,
    },
    clinicOpeningTime: {
        type: String,
        required: true,
    },
    clinicClosingTime: {
        type: String,
        required: true,
    },
    clinicTimeZone: {
        type: String,
        default: process.env.GOOGLE_CALENDAR_TIME_ZONE || "Asia/Kolkata",
    },
    googleRefreshToken: {
        type: String,
        default: null,
    },
    googleCalendarId: {
        type: String,
        default: "primary",
    },
    appointmentDurationMinutes: {
        type: Number,
        min: 5,
        max: 240,
        default: 30,
    },
});
export const Doctor = mongoose.model("Doctor", doctorSchema);
//# sourceMappingURL=doctordetails.js.map