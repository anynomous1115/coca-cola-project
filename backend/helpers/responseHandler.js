const error = (res, error = {}) => {
    let code = 500;
    let message = "Internal Server Error";
    let details = null;

    // Handle specific error types
    if (error.name === "AxiosError") {
        // Handle Axios errors (e.g., GHN API 404)
        code = error.response?.status || 500;
        message = error.response?.data?.message || error.message || "Error with external API";
        details = error.response?.data || null;
    } else if (error.name === "ValidationError") {
        // Handle Mongoose validation errors
        code = 400;
        message = "Validation error";
        details = Object.values(error.errors).map(err => ({
            field: err.path,
            message: err.message,
        }));
    } else if (error.name === "TypeError") {
        // Handle TypeError (e.g., Order is not a constructor)
        code = 500;
        message = error.message || "Internal server error";
        details = { error: error.message };
    } else if (error.name === "MongoError" && error.code === 11000) {
        // Handle MongoDB duplicate key errors
        code = 409;
        message = "Duplicate key error";
        details = { key: error.keyValue };
    } else {
        // Generic error handling
        code = error.code || 500;
        message = error.message || "Internal Server Error";
        details = error.details || null;
    }

    // Ensure consistent response format
    res.status(code).json({
        success: false,
        message,
        code,
        ...(details && { details }),
    });
};

const success = (res, data = null, message = "Successful", code = 200) => {
    const response = {
        success: true,
        message,
        ...(data !== null && { data }),
    };

    res.status(code).json(response);
};

module.exports = { error, success };