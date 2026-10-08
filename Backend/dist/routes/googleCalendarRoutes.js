import { Router } from "express";
import { createDoctorGoogleAuthUrl, storeDoctorGoogleRefreshToken, } from "../lib/google.js";
import { Doctor } from "../modal/doctordetails.js";
import { createAgentToken, verifyAgentToken } from "../lib/tenantContext.js";
const googleCalendarRoutes = Router();
googleCalendarRoutes.get("/doctors/:doctorId/connect", async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.doctorId);
        if (!doctor)
            return res.status(404).json({ message: "Doctor not found" });
        const state = createAgentToken({
            doctorId: doctor._id.toString(),
            threadId: "google-oauth",
            expiresInSeconds: 600,
        });
        const authUrl = createDoctorGoogleAuthUrl(state);
        return res.redirect(authUrl);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Unable to start Google Calendar connection",
        });
    }
});
googleCalendarRoutes.get("/oauth2callback", async (req, res) => {
    try {
        const code = req.query.code;
        const state = req.query.state;
        if (typeof code !== "string" || typeof state !== "string") {
            return res.status(400).json({
                message: "Missing Google OAuth code or doctor id",
            });
        }
        const context = verifyAgentToken(state);
        const doctor = await storeDoctorGoogleRefreshToken(context.doctorId, code);
        return res.status(200).json({
            message: "Google Calendar connected successfully",
            doctorId: doctor._id,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Unable to complete Google Calendar connection",
        });
    }
});
export default googleCalendarRoutes;
//# sourceMappingURL=googleCalendarRoutes.js.map