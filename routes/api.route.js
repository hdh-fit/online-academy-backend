const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { valid } = require('../middlewares/vilidate.mdw');
const validUserSchema = require('../schemas/user.json');
const jwt = require('jsonwebtoken');
const authMiddewares =  require('../middlewares/auth.mdw');

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
          const data = docs.map(item=>({...item,teacherName:'Jeff'}))
          return res.json(data)
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


router.get('/course/detail/:id', (req, res) => {
  Course.findOne({ _id: req.params.id })
     .lean()
    .exec(function (error, doc) {
      if (error) return res.status(304).end();
      else {
        if (doc) {
          //tim video voi course do
          Video.find({ id_course: doc._id }, (err, videos) => {
            doc.video = videos;
            //tim User đã comment 
            let arrUserComment = [];
            for (let i = 0; i < doc.review.length; i++) {
              arrUserComment.push(doc.review[i].id_user);
            }
            User.find({
              '_id': {
                $in: arrUserComment
              }
            }).lean().exec(function (err, UsersComment) {
              for (let i = 0; i < doc.review.length; i++) {
                for (let j = 0; j < UsersComment.length; j++) {
                  if (doc.review[i].id_user.equals(UsersComment[j]._id)) {
                    doc.review[i].fullname = UsersComment[j].fullname;
                    break;
                  }
                }
              }
              res.json(doc)
            });
          })
        }
        else return res.json({ err: 'No item with provided id' })
      }
    });
});

router.post('/user/register', valid(validUserSchema), (req,res)=>{
  const newuser = new User(req.body);
  User.findOne({username: newuser.username})
    .exec(function(error, doc) {
        console.log(error)
        if(error) return res.status(304).end();
        else{
          if(doc) return res.json({err:'User already exists'})
          else {
            newuser.password = bcrypt.hashSync(newuser.password, 10);
            newuser.save();
            res.json(newuser);
          }
        }
    });
});

router.post('/user/login', (req,res)=>{
  const user = req.body;
  User.findOne({username: user.username})
    .exec(function(error, doc) {
        console.log(error)
        if(error) return res.status(304).end();
        else {
          if (doc) {

            if (!bcrypt.compareSync(user.password, doc.password)){
              return res.json({
                  authenticated: false
              });
            }

            const payload = {
              id: doc.id,
              type: doc.type
            }
    
            const opts = {
                expiresIn: 36000
            }
    
            const accessToken = jwt.sign(payload, 'WEDNC2021', opts);
            
            return res.json({
                authenticated: true,
                accessToken: accessToken
            });
          }
          else return res.json({err:'User not exists'})
        }
    });
});

router.get('/user/info', authMiddewares, (req,res)=>{
  User.findOne({_id:req.user.id})
     .exec(function(error, doc) {
         console.log(error)
         if(error) return res.status(304).end();
         else{
           if(doc) return res.json(doc);
           else return res.json({err:'User not exists'});
         }
     });
});

router.put('/user/info', authMiddewares, (req,res)=>{
  User.findOne({_id:req.user.id})
     .exec(function(error, doc) {
         console.log(error)
         if(error) return res.status(304).end();
         else{
           if(doc) {
             doc.fullname = req.body.fullname; 
             doc.phone = req.body.phone;
             doc.gender = req.body.gender;
             doc.dob = req.body.dob;
             doc.describe = req.body.describe;
             doc.level = req.body.level;
             doc.email = req.body.email;
             doc.save();
             return res.json(doc);
           }
           else return res.json({err:'User not exists'});
         }
     });
});

router.put('/user/password', authMiddewares, (req,res)=>{
  User.findOne({_id:req.user.id})
     .exec(function(error, doc) {
         console.log(error)
         if(error) return res.status(304).end();
         else{
           if(doc) {

            if (!bcrypt.compareSync(req.body.password, doc.password)){
              return res.json({
                  message: "Incorrect password"
              });
            }

            doc.password = bcrypt.hashSync(req.body.newpassword, 10);
            doc.save();
            return res.json({
              message: "Change password successfully"
            });
           }
           else return res.json({err:'User not exists'});
         }
     });
});

module.exports = router;
