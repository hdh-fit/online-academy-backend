const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

//connect to mongodb
let mongoose=require('mongoose');
mongoose.connect('mongodb+srv://master:worker@cluster0.shiaf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {useNewUrlParser: true,useUnifiedTopology: true });
//model
const courseSchema = new mongoose.Schema({
    stt:String,
    name:String,
    short_described:String,
    full_described:String,
    rating:Number,
    image_link:String,
    sttTeacher:String,
    dateCourse:Date,
    isFinish: Boolean,
    view: Number,
    price: Number,
    category:String,
    review:[{type:String}],
    feedBack:[{type:String}]});
const Course = mongoose.model('Course', courseSchema);

const userSchema= new mongoose.Schema({
  stt:String,
  fullname:String,
  username:String,
  password:String,
  phone:String,
  type:Number,
  gender:String,
  dob:Date,
  describe:String,
  level:String,
  email:String
})
const User = mongoose.model('User', userSchema);

const videoSchema= new mongoose.Schema({
  name:String,
  stt_course:String,
  link:String
})
const Video = mongoose.model('Video', videoSchema);

router.get

module.exports = router;