const mongoose = require('mongoose');
const { Course } = require("./course_model");
const categorySchema = new mongoose.Schema({
    name:String,
    label:String,
    category:String
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

    findCategoryByCategory(category) {
        return Category.findOne({ category: category }).lean().exec();
    },

    async deleteByName(name) {
        const course = await Course.find({'category': name}).exec();
        if (course.length !== 0) {
            return false;
        }
        return Category.deleteOne({ name: name }).exec();
    },

    async deleteById(id) {
        const cate = await Course.find({_id: id}).lean().exec();
        const course = await Course.find({'category': cate.name}).lean().exec();
        if (course.lenght !== 0) {
            return false;
        }
        return Category.deleteOne({ 'category': cate.name }).exec();
    },

    async updateCategory(category) {
        const updates = {
            label: category.label,
        }

        const data = await Category.findOneAndUpdate(
            {_id: category.id}, 
            {$set: updates},
            { new: true }
        );

        return data;
    },
}

