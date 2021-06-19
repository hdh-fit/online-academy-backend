const db = require('../utils/database');

module.exports = {
    getall() {
        return db('category');
    },
};
