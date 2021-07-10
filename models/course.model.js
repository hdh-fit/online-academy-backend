const db = require('../utils/database');

module.exports = {
    async getall() {
        const data = await db('course').innerJoin('category', 'course.idCategory', 'category.id');
        return data;
    },

    //Xem chi tiết khoá học
    async getById(id) {
        const course = await db('course').where('course.id', id);
        if (course.length == 0) return null;

        return course[0];
    },

    async updateById(id, course) {
        const data = await db('course').where('id', id).update(course);
        return data;
    },

    async deleteById(id) {
        const city = await db('course').where('id', id);
        if (city.length == 0) return null;

        const data = await db('course').where('id', id).del();
        return data;
    },

    //top 10 khoá học được xem nhiều nhất
    async getTop10View() {
        const data = await db('course').orderBy('view', 'desc').limit(10);

        return data;
    },

    //top 10 khoá học mới nhất
    async getTop10DayCreate() {
        const data = await db('course').orderBy('dateCourse', 'desc').limit(10);

        return data;
    },

    //Get all in a category
    async getAllByCategoryId(idCategory) {
        const data = await db('course').where('idCategory', idCategory);

        return data;
    },
};
