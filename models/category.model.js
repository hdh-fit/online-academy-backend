const mongoose = require('mongoose');
const { Course } = require("./course_model");
const categorySchema = new mongoose.Schema({
    name:String,
    label:String
});
const Category = mongoose.model('Category', categorySchema);

module.exports = {
	Category: mongoose.model('Category', categorySchema),

    async addCategory(category) {
        const newCategory = new Category(category);
        await newCategory.save();
        return newCategory.toObject();
    },

    findCategoryByName(name) {
        return Category.findOne({ name: name }).lean().exec();
    },

    async deleteByName(name) {
        const course = await Course.find({'category': name}).lean().exec();
        if (course.lenght === 0) {
            return false;
        }
        return Category.deleteOne({ name: name }).exec();
    },

    async deleteById(id) {
        const course = await Course.find({_id: id}).lean().exec();
        if (course.lenght === 0) {
            return false;
        }
        return Category.deleteOne({ _id: id }).exec();
    },
}
