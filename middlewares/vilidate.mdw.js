const Ajv = require('ajv').default;

function valid(schema) { 
    return function(req, res, next) {
        const ajv = new Ajv();
        const validate = ajv.compile(schema);
        const valid = validate(req.body);
        
        if (!valid) {
            return res.status(400).json(validate.errors);
        }

        next();
    }
}

module.exports = { valid }