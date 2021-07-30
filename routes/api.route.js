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
    idTeacher:String,
    dateCourse:Date,
    isFinish: Boolean,
    view: Number,
    price: Number,
    category:String,
    review:[{comment:String,id_user:mongoose.ObjectId,rate:Number}],
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
  id_course:String,
  link:String
})
const Video = mongoose.model('Video', videoSchema);

//lấy tất cả danh sách khóa học
router.get('/course/all',(req,res)=>{
 Course.find({})
    .exec(function(error, docs) {
        if(error) return res.status(304).end();
        else{
          return res.json(docs)
        }
    });
});

router.get('/course/top-10-view',(req,res)=>{
  Course.find({})
    .sort({view: -1})// sắp xếp giảm dần theo view
    .limit(10)// lấy nhiều nhất 10 item
    .exec(function(error, docs) {
        if(error) return res.status(304).end();
        else{
          // for(let i=0;i<docs.length;i++) console.log(docs[i].view) //test ok
          return res.json(docs)
        }
    });
})

router.get('/course/top-10-date-create',(req,res)=>{
  Course.find({})
    .sort({dateCourse: -1})// sắp xếp giảm dần theo thời gian
    .limit(10)// lấy nhiều nhất 10 item
    .exec(function(error, docs) {
        if(error) return res.status(304).end();
        else{
          // for(let i=0;i<docs.length;i++) console.log(docs[i].dateCourse) // test ok
          return res.json(docs)
        }
    });
})

router.get('/course/detail/:id',(req,res)=>{
 Course.findOne({_id:req.params.id})
    .exec(function(error, doc) {
        console.log(error)
        if(error) return res.status(304).end();
        else{
          if(doc) return res.json(doc)
          else return res.json({err:'No item with provided id'})
        }
    });
});


module.exports = router;
