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
	listStudent: [String],
	joinWeek: { type: Number, default: 0 },
});
const Course = mongoose.model('Course', courseSchema);

const videoSchema = new mongoose.Schema({
	name: String,
	id_course: String,
	link: String
});
const Video = mongoose.model('Video', videoSchema);

const blackCourseSchema = new mongoose.Schema({
  stt: String,
  name: String,
  short_described: String,
  full_described: String,
  rating: Number,
  image_link: String,
  idTeacher: String,
  dateCourse: Date,
  isFinish: Boolean,
  view: Number,
  price: Number,
  category: String,
  review: [{ comment: String, id_user: mongoose.ObjectId, rate: Number, date: { type: Date, default: Date.now } }],
  feedBack: [{ type: String }]
});
const BlackCourse = mongoose.model('BlackCourse', blackCourseSchema);
module.exports = { Course, Video, BlackCourse };

