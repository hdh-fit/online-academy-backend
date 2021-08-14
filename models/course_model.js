const mongoose = require('mongoose');
const courseSchema = new mongoose.Schema({
	stt: String,
	name: String,
	short_described: String,
	full_described: String,
	rating: Number,
	image_link: String,
	idTeacher: String,
	dateCourse: { type: Date, default: Date.now },
	isFinish: Boolean,
	view: Number,
	price: Number,
	category: String,
	review: [{ comment: String, id_user: mongoose.ObjectId, rate: Number, date: { type: Date, default: Date.now } }],
	feedBack: [{ type: String }],
	listStudent: [String]
});
const Course = mongoose.model('Course', courseSchema);

const videoSchema = new mongoose.Schema({
	name: String,
	id_course: String,
	link: String
});
const Video = mongoose.model('Video', videoSchema);

module.exports = { Course, Video };

