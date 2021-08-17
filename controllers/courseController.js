require("dotenv").config();
const MONGODB_URL = process.env.MONGO_URL;
const mongoose = require('mongoose');
const { Course } = require("../models/course_model");
const { User } = require("../models/user.model");
const Response = require('../jsonResponse/jsonResponse');
mongoose.connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });

const searchCourse = (keyword) => {
	return new Promise((resolve, reject) => {
		Course.find({ name: { $regex: new RegExp(keyword, 'i') } }).lean().exec((err, docs) => {
			if (err) {
				reject(err);
			} else {
				let teacherId = [];
				for (let i = 0; i < docs.length; i++) {
					teacherId.push(docs[i].idTeacher);
				}
				User.find({
					'_id': {
						$in: teacherId
					}
				}).select('fullname').exec(function (err, teachersName) {
					for (let i = 0; i < docs.length; i++) {
						for (let j = 0; j < teachersName.length; j++) {
							if (docs[i].idTeacher == teachersName[j]._id) {
								docs[i].nameTeacher = teachersName[j].fullname;
								break;
							}
						}
					}
					if (err) {
						reject(err);
					} else {
						resolve(docs);
					}
				});
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

const searchCourseEndPoint = async (req, res) => {
	const keyword = req.params.text;
	const perPage = parseInt(req.params.limitPerPage)
	const page = Math.max(1, req.params.pageNumber)
	const course = await Course.aggregate([
		{
		  '$search': {
			'index': 'default',
			'text': {
			  'query': keyword,
			  'path': [ 'name', 'category' ]

			}
		  }
		},
		{ '$project': {
			'_id': 1,
			'name':1,
			'rating':1,
			'image_link':1,
			'dateCourse':1,
			'isFinish':1,
			'view':1,
			'price':1,
			'category':1,
			'idTeacher':1,
			'score' : {'$meta' : 'searchScore'}
			}
		}
	  ]);
	if (course) {
		let pageMax = Math.floor(course.length / perPage);
		if (course.length / perPage != pageMax) pageMax +=1;
		const data = [];
		for (let i = 0; i < perPage && i + perPage * (page-1) < course.length; i++) {
            data[i] = course[i + perPage * (page	-1)];
        }
		
		let teacherId = [];
    	for (let i = 0; i < data.length; i++) {
            teacherId.push(data[i].idTeacher);
        }
        const teachersName = await User.find({'_id': {$in: teacherId}}).select('fullname').exec();
	
        for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < teachersName.length; j++) {
                if (data[i].idTeacher == teachersName[j]._id) {
                    data[i].nameTeacher = teachersName[j].fullname;
                    break;
                }
            }
        }
		const response = Response.successResponse({course: data, pageMax: pageMax});
		res.status(200).json(response);
	} 
	else {
		const response = Response.falseResponse('Some thing wrong');
        return res.status(304).json(response);
	}

};

module.exports = {
	searchCourse,
	getCourseByCategoryName,
	searchCourseEndPoint
};
