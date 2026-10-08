import { Router } from "express";
import multer from "multer";
import { randomUUID } from "node:crypto";
import { ingestDoctorKnowledge, searchDoctorKnowledge, } from "../controller/knowledgecontroller.js";
import { doctorDetails, getDoctorProfile, } from "../controller/usercontroller.js";
import { Doctor } from "../modal/doctordetails.js";
import { createAgentToken } from "../lib/tenantContext.js";
import { optionalAgentContext } from "../middleware/agentContext.js";
import { requireAuth } from "../middleware/auth.js";
const doctorRoutes = Router();
doctorRoutes.use(optionalAgentContext);
const pdfUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, callback) => {
        callback(null, file.mimetype === "application/pdf");
    },
});
doctorRoutes.post("/profile", requireAuth, doctorDetails);
doctorRoutes.get("/profile", requireAuth, getDoctorProfile);
doctorRoutes.post("/agent/:doctorId/token", async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.doctorId);
        if (!doctor)
            return res.status(404).json({ message: "Doctor not found" });
        const threadId = typeof req.body?.threadId === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(req.body.threadId)
            ? req.body.threadId
            : randomUUID();
        return res.status(201).json({
            token: createAgentToken({
                doctorId: doctor._id.toString(),
                threadId,
            }),
            doctorId: doctor._id,
            threadId,
        });
    }
    catch (error) {
        console.error("Unable to create doctor agent token:", error);
        return res.status(500).json({ message: "Unable to create doctor agent token" });
    }
});
doctorRoutes.post("/knowledge", requireAuth, pdfUpload.single("file"), ingestDoctorKnowledge);
doctorRoutes.post("/knowledge/search", requireAuth, searchDoctorKnowledge);
export default doctorRoutes;
//# sourceMappingURL=doctorRoutes.js.map