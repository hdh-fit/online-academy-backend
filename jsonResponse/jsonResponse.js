module.exports = {
    successResponse(data) {
        const response = {
            success: true,
            data: data
        };

        return response;
    },

    falseResponse(msg) {
        const response = {
            success: false,
            error_message: msg
        };

        return response;
    }
};