import { runWithAgentContext } from "../lib/requestContext.js";
import { getBearerToken, verifyAgentToken } from "../lib/tenantContext.js";
export const optionalAgentContext = (req, res, next) => {
    const token = getBearerToken(req.get("authorization"));
    if (!token)
        return next();
    try {
        const context = verifyAgentToken(token);
        return runWithAgentContext(context, async () => next());
    }
    catch {
        return res.status(401).json({ message: "Invalid or expired doctor agent token" });
    }
};
//# sourceMappingURL=agentContext.js.map