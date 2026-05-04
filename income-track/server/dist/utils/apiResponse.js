export function sendSuccess(res, data, status = 200, message) {
    return res.status(status).json({
        success: true,
        data,
        message
    });
}
export function sendError(res, code, message, status = 400, details) {
    return res.status(status).json({
        error: {
            code,
            message,
            details
        }
    });
}
export function zodDetails(error) {
    const details = {};
    for (const issue of error.issues) {
        details[issue.path.join(".") || "root"] = issue.message;
    }
    return details;
}
