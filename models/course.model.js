const db = require('../utils/database');

module.exports = {
    async getall() {
        return await db('course');
    },

    async findById(id) {
        const course = await db('course').where('id', id);
        if (course.length == 0) return null;

        return course[0];
    },

    async updateById(id, course) {
        return await db('course').where('id', id).update(course);
    },

    async deleteById(id) {
        const city = await db('course').where('id', id);
        if (city.length == 0) return null;
        
        return await db('city').where('id', id).del();
    },
};
