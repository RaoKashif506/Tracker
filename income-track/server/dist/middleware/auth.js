import { verifyToken } from "../utils/jwt.js";
import { sendError } from "../utils/apiResponse.js";
export function requireAuth(req, res, next) {
    const token = req.cookies.auth_token;
    if (!token)
        return sendError(res, "UNAUTHORIZED", "Unauthorized", 401);
    try {
        req.auth = verifyToken(token);
        next();
    }
    catch {
        return sendError(res, "UNAUTHORIZED", "Unauthorized", 401);
    }
}
