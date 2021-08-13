require("dotenv").config();
const MONGODB_URL = process.env.MONGO_URL;
const mongoose = require('mongoose');
const { Category } = require("../models/category.model");
const { Course } = require("../models/course_model");
mongoose.connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });

const searchCourse = (keyword) => {
	return new Promise((resolve, reject) => {
		Course.find({ name: { $regex: new RegExp(keyword, 'i') } }).lean().exec((err, docs) => {
			if (err) {
				reject(err);
			} else {
				resolve(docs);
			}
		});
	});
};

const getCourseByCategoryName = (categoryName) => {
	return new Promise((resolve, reject) => {
		Course.find({ category: categoryName }).lean()
			.exec(function (error, docs) {
				if (error) {
					reject(error);
				}
				else {
					let teacherId = [];
					for (let i = 0; i < docs.length; i++) {
						teacherId.push(docs[i].idTeacher);
					}
					User.find({
						'_id': {
							$in: teacherId
						}
					}).select('fullname').exec(function (err, teachersName) {
						if (err) {
							reject(err);
						} else {
							for (let i = 0; i < docs.length; i++) {
								for (let j = 0; j < teachersName.length; j++) {
									if (docs[i].idTeacher == teachersName[j]._id) {
										docs[i].nameTeacher = teachersName[j].fullname;
										break;
									}
								}
							}
							resolve(docs);
						}
					});
				}
			});
	});
};

module.exports = {
	searchCourse,
	getCourseByCategoryName,
};
