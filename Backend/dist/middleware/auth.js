import { getBearerToken } from "../lib/tenantContext.js";
import { verifyAccessToken } from "../lib/auth.js";
export const requireAuth = (req, res, next) => {
    try {
        const token = getBearerToken(req.get("authorization"));
        if (!token)
            return res.status(401).json({ message: "Authentication required" });
        req.user = verifyAccessToken(token);
        return next();
    }
    catch {
        return res.status(401).json({ message: "Invalid or expired access token" });
    }
};
export const requireRole = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role))
        return res.status(403).json({ message: "Insufficient permissions" });
    return next();
};
//# sourceMappingURL=auth.js.map