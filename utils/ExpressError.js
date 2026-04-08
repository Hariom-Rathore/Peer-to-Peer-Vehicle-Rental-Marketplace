class ExpressError extends Error {
    constructor(statusCode, message, viewData = {}) {
        super(message);
        this.statusCode = statusCode;
        this.viewData = viewData;
    }
}

module.exports = ExpressError;
