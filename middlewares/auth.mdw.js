const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token) {
        try {
            const decoded = jwt.verify(token, 'WEDNC2021');
            console.log(decoded);
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({
                message: 'Invalid access token'
            });
        }
        
    } else {
        return res.status(400).json({
            message: 'Access token not found'
        });
    }
}