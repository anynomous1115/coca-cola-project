exports.errorHandler = (res, error = {}) => {
    const code = error.code || 500;
    const message = error.message || "Internal Server Error";
    const details = error.details || null;
    res.status(code).json({
        success: false,
        message,
        code,
        ...(details && { details })
    });
};

exports.successHandler = (
    res,
    data = null,
    message = "Successful",
    code = null
) => {
    res.status(code).json({
        success: true,
        data,
        message,
        code
    });
};
