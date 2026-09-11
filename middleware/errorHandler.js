function errorHandler(err, req, res, next) {
    console.error('Unexpected error:', err);

    res.status(500).json({
        message: 'Something went wrong on the server. Please try again later.'
    });
}

module.exports = errorHandler;