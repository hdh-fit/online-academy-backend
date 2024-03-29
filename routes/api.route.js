require("dotenv").config();
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { valid } = require('../middlewares/vilidate.mdw');
const validUserSchema = require('../schemas/user.json');
const validCategorySchema = require('../schemas/category.json');
const jwt = require('jsonwebtoken');
const authMiddewares = require('../middlewares/auth.mdw');
const Response = require('../jsonResponse/jsonResponse');
const UserModel = require("../models/user.model");
const User = UserModel.User;
const CategoryModel = require('../models/category.model');
const { Category } = require("../models/category.model");
const { Course, Video, BlackCourse } = require("../models/course_model");
const courseController = require("../controllers/courseController");

//lấy tất cả danh sách khóa học
router.get('/course/all', (req, res) => {
  Course.find({}).lean()
    .exec(function (error, docs) {
      if (error) {
        const response = Response.falseResponse(error);
        return res.status(304).json(response);
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
          for (let i = 0; i < docs.length; i++) {
            for (let j = 0; j < teachersName.length; j++) {
              if (docs[i].idTeacher == teachersName[j]._id) {
                docs[i].nameTeacher = teachersName[j].fullname;
                break;
              }
            }
          }
          const response = Response.successResponse(docs);
          return res.status(200).json(response);
        });
      }
    });
});

router.get('/course/top-10-view', (req, res) => {
  Course.find({})
    .sort({ view: -1 })// sắp xếp giảm dần theo view
    .limit(10)// lấy nhiều nhất 10 item
    .lean()
    .exec(function (error, docs) {
      if (error) {
        const response = Response.falseResponse(error);
        return res.status(304).json(response);
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
          for (let i = 0; i < docs.length; i++) {
            for (let j = 0; j < teachersName.length; j++) {
              if (docs[i].idTeacher == teachersName[j]._id) {
                docs[i].nameTeacher = teachersName[j].fullname;
                break;
              }
            }
          }
          const response = Response.successResponse(docs);
          return res.status(200).json(response);
        });
      }
    });
});

router.get('/course/top-5-join', async (req,res)=>{
  const course = await Course.find({},
    '_id name rating image_link dateCourse isFinish view price newPrice category idTeacher joinWeek')
    .sort({ joinWeek: -1 }).limit(5).lean().exec();

  if (course) {
		let teacherId = [];
    	for (let i = 0; i < course.length; i++) {
            teacherId.push(course[i].idTeacher);
        }
        const teachersName = await User.find({'_id': {$in: teacherId}}).select('fullname').exec();

        for (let i = 0; i < course.length; i++) {
            for (let j = 0; j < teachersName.length; j++) {
                if (course[i].idTeacher == teachersName[j]._id) {
                    course[i].nameTeacher = teachersName[j].fullname;
                    break;
                }
            }
        }
		const response = Response.successResponse(course);
		res.status(200).json(response);
	}
	else {
		const response = Response.falseResponse('Some thing wrong');
    return res.status(304).json(response);
	}
})

router.get('/course/top-10-date-create', (req, res) => {
  Course.find({})
    .sort({ dateCourse: -1 })// sắp xếp giảm dần theo thời gian
    .limit(10)// lấy nhiều nhất 10 item
    .lean()
    .exec(function (error, docs) {
      if (error) {
        const response = Response.falseResponse(error);
        return res.status(304).json(response);
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
          console.log(teachersName);
          for (let i = 0; i < docs.length; i++) {
            for (let j = 0; j < teachersName.length; j++) {
              if (docs[i].idTeacher == teachersName[j]._id) {
                docs[i].nameTeacher = teachersName[j].fullname;
                break;
              }
            }
          }
          const response = Response.successResponse(docs);
          return res.status(200).json(response);
        });
      }
    });
});


router.get('/course/detail/:id', (req, res) => {
  Course.findOne({ _id: req.params.id })
    .exec(function (error, doc) {
      if (error) {
        const response = Response.falseResponse(error);
        return res.status(304).json(response);
      }
      else {
        if (doc) {
          doc.view++;
          doc.save();
          doc = doc.toObject();
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
            }).lean().exec(async function (err, UsersComment) {
              for (let i = 0; i < doc.review.length; i++) {
                for (let j = 0; j < UsersComment.length; j++) {
                  if (doc.review[i].id_user.equals(UsersComment[j]._id)) {
                    doc.review[i].fullname = UsersComment[j].fullname;
                    break;
                  }
                }
              }
              const teacher = await UserModel.findUserById(doc.idTeacher);
              delete teacher.password;
              delete teacher.username;
              delete teacher.phone;
              doc.teacher = teacher;
              const response = Response.successResponse(doc);
              return res.status(200).json(response);
            });
          });
        }
        else {
          const response = Response.falseResponse('No item with provided id');
          return res.status(304).json(response);
        }
      }
    });
});

router.post('/user/register', valid(validUserSchema), async (req, res) => {

  const newuser = req.body;

  const checkUsername = await UserModel.findUserByUsername(newuser.username);

  if (checkUsername) {
    const response = Response.falseResponse('User already exists');
    return res.status(200).json(response);
  }

  const checkEmail = await UserModel.findUserByEmail(newuser.email);

  if (checkEmail) {
    const response = Response.falseResponse('Email already exists');
    return res.status(200).json(response);
  }

  const user = await UserModel.addNewUser(newuser);

  if (user) {
    delete user.password;
    const response = Response.successResponse(user);
    return res.status(200).json(response);
  }

  const response = Response.falseResponse('Cant register this user');
  return res.status(200).json(response);
});

router.post('/user/login', async (req, res) => {
  const user = req.body;

  const checkUsername = await UserModel.findUserByUsername(user.username);

  if (checkUsername == null) {
    const response = Response.falseResponse('User not exists');
    return res.status(200).json(response);
  }

  if (checkUsername.disable) {
    const response = Response.falseResponse('User have been block');
    return res.status(200).json(response);
  }


  if (!bcrypt.compareSync(user.password, checkUsername.password)) {
    return res.json({
      authenticated: false
    });
  }

  const payload = {
    id: checkUsername._id,
    type: checkUsername.type
  };

  console.log(payload);

  const opts = {
    expiresIn: 36000
  };

  const accessToken = jwt.sign(payload, 'WEDNC2021', opts);

  const data = {
    authenticated: true,
    accessToken: accessToken
  };

  const response = Response.successResponse(data);
  return res.status(200).json(response);
});

router.get('/user/info', authMiddewares, async (req, res) => {
  const user = await UserModel.findUserById(req.user.id);

  if (user) {
    delete user.password;
    const response = Response.successResponse(user);
    return res.status(200).json(response);
  }
  else {
    const response = Response.falseResponse('User not exists');
    return res.status(200).json(response);
  }

});

router.put('/user/info', authMiddewares, async (req, res) => {
  const user = await UserModel.findUserById(req.user.id);

  if (user) {
    const data = await UserModel.updateUser(user._id, req.body);
    const response = Response.successResponse(data);
    return res.status(200).json(response);
  }
  else {
    const response = Response.falseResponse('User not exists');
    return res.status(200).json(response);
  }
});

router.put('/user/password', authMiddewares, async (req, res) => {
  const user = await UserModel.findUserById(req.user.id);

  if (user) {
    if (!bcrypt.compareSync(req.body.password, user.password)) {
      const response = Response.falseResponse('Incorrect password');
      return res.status(200).json(response);
    }

    const password = bcrypt.hashSync(req.body.newpassword, 10);

    const data = await UserModel.updateUserPassword(user._id, password);

    const response = Response.successResponse({ message: 'Change password successfully' });
    return res.status(200).json(response);

  }
  else {
    const response = Response.falseResponse('User not exists');
    return res.status(200).json(response);
  }
});

router.post('/user/watchlist', authMiddewares, async (req, res) => {
  course = req.body.course;

  const watchlist = await UserModel.addWatchlist(req.user.id, course);
  if (watchlist) {
    const response = Response.successResponse(watchlist);
    return res.status(200).json(response);
  }
  else {
    const response = Response.falseResponse('Add watchlist false');
    return res.status(200).json(response);
  }
});

router.get('/user/watchlist', authMiddewares, async (req, res) => {
  const watchlist = await UserModel.getWatchlist(req.user.id);
  if (watchlist) {
    const response = Response.successResponse(watchlist);
    return res.status(200).json(response);
  }
  else {
    const response = Response.falseResponse('Get watchlist false');
    return res.status(200).json(response);
  }
});

router.post('/review/:idCourse', authMiddewares, (req, res) => {
  const idCourse = req.params.idCourse;
  User.findOne({ _id: req.user.id })
    .exec(function (error, doc) {
      if (error) {
        const response = Response.falseResponse(error);
        return res.status(200).json(response);
      }
      else {
        if (doc) {
          if (doc.listCourse.indexOf(idCourse) > -1) {
            Course.findOne({ _id: idCourse }).exec((err, course) => {
              if (course) {
                let reviewObject = {
                  comment: req.body.comment,
                  rate: parseInt(req.body.rate),
                  id_user: req.user.id
                };
                course.review.push(reviewObject);
                course.rating = 0;
                for (let i = 0; i < course.review.length; i++) {
                  course.rating += course.review[i].rate;
                }
                course.rating = course.rating / course.review.length;
                course.save();
                const data = course.review[course.review.length-1].toObject();
                data.fullname = doc.fullname;
                const response = Response.successResponse({review:data, courseRating:course.rating});
                return res.status(200).json(response);
              } else {
                const response = Response.falseResponse('không tìm thấy course với id');
                return res.status(200).json(response);
              }
            });
          }
          else {

            const response = Response.falseResponse('User not join this course');
            return res.status(200).json(response);
          }
        }
        else {

          const response = Response.falseResponse('User not exists');
          return res.status(200).json(response);
        }
      }
    });
});

router.get('/user/all', authMiddewares, async (req, res) => {
  if (req.user.type !== 3) {
    const response = Response.falseResponse('User has no permissions');
    return res.status(200).json(response);
  }
  const user = await UserModel.findUserById(req.user.id);
  if (user) {
    const all = await UserModel.getAllUser();
    const response = Response.successResponse(all);
    return res.status(200).json(response);
  }
  else {
    const response = Response.falseResponse('User not exists');
    return res.status(200).json(response);
  }
});

router.get('/user/all/:type', authMiddewares, async (req, res) => {
  const type = req.params.type;
  if (req.user.type !== 3) {
    const response = Response.falseResponse('User has no permissions');
    return res.status(200).json(response);
  }
  const user = await UserModel.findUserById(req.user.id);
  if (user) {
    const all = await UserModel.getUserByType(type);
    const response = Response.successResponse(all);
    return res.status(200).json(response);
  }
  else {
    const response = Response.falseResponse('User not exists');
    return res.status(200).json(response);
  }
});

router.get('/user/listCourse', authMiddewares, async (req, res) => {
  const Courselist = await UserModel.getCourselist(req.user.id);
  if (Courselist) {
    const response = Response.successResponse(Courselist);
    return res.status(200).json(response);
  }
  else {
    const response = Response.falseResponse('Get Courselist false');
    return res.status(200).json(response);
  }
});

router.get('/user/:id', authMiddewares, async (req, res) => {
  if (req.user.type !== 3) {
    const response = Response.falseResponse('User has no permissions');
    return res.status(200).json(response);
  }

  const user = await UserModel.findUserById(req.user.id);
  if (user) {
    const data = await UserModel.findUserById(req.params.id);
    delete data.password;
    const response = Response.successResponse(data);
    return res.status(200).json(response);
  }
  else {
    const response = Response.falseResponse('User not exists');
    return res.status(200).json(response);
  }
});

router.post('/disableuser', authMiddewares, async (req, res) => {
  if (req.user.type !== 3) {
    const response = Response.falseResponse('User has no permissions');
    return res.status(200).json(response);
  }

  const user = await UserModel.findUserById(req.user.id);

  if (user) {
    const disableUser = await UserModel.disableUser(req.body.id);
    if (disableUser) {
      const response = Response.successResponse({ msg: "Disable success" });
      return res.status(200).json(response);
    }
    const response = Response.falseResponse('Disable fail');
    return res.status(200).json(response);
  }
  else {
    const response = Response.falseResponse('User not exists');
    return res.status(200).json(response);
  }
});

router.post('/enableuser', authMiddewares, async (req, res) => {
  if (req.user.type !== 3) {
    const response = Response.falseResponse('User has no permissions');
    return res.status(200).json(response);
  }

  const user = await UserModel.findUserById(req.user.id);

  if (user) {
    const enableUser = await UserModel.enableUser(req.body.id);
    if (enableUser) {
      const response = Response.successResponse({ msg: "Enable success" });
      return res.status(200).json(response);
    }
    const response = Response.falseResponse('Enable fail');
    return res.status(200).json(response);
  }
  else {
    const response = Response.falseResponse('User not exists');
    return res.status(200).json(response);
  }
});

router.delete('/user', authMiddewares, async (req, res) => {
  if (req.user.type !== 3) {
    const response = Response.falseResponse('User has no permissions');
    return res.status(200).json(response);
  }

  const user = await UserModel.findUserById(req.user.id);

  if (req.user.id === req.body.id) {
    const response = Response.falseResponse('Can not delete this user');
    return res.status(200).json(response);
  }

  if (user) {
    await UserModel.deleteById(req.body.id);
    const response = Response.successResponse({ msg: "Delete success" });
    return res.status(200).json(response);
  }
  else {
    const response = Response.falseResponse('User not exists');
    return res.status(200).json(response);
  }
});

router.get('/getCategoryAll', (req, res) => {
  Category.find({}, (err, docs) => {
    return res.json({ success: 'true', categories: docs });
  });
});

router.get('/getCourseByCategoryName/:name', (req, res) => {
  Course.find({ category: req.params.name }).lean()
    .exec(function (error, docs) {
      if (error) {
        const response = Response.falseResponse(error);
        return res.status(304).json(response);
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
          for (let i = 0; i < docs.length; i++) {
            for (let j = 0; j < teachersName.length; j++) {
              if (docs[i].idTeacher == teachersName[j]._id) {
                docs[i].nameTeacher = teachersName[j].fullname;
                break;
              }
            }
          }
          const response = Response.successResponse(docs);
          return res.status(200).json(response);
        });
      }
    });
});

router.get('/getCourseByCategoryId/:idCategory', (req, res) => {
  Category.findOne({ _id: req.params.idCategory }, (err, doc) => {
    if (doc)
      Course.find({ category: doc.name }).lean()
        .exec(function (error, docs) {
          if (error) {
            const response = Response.falseResponse(error);
            return res.status(304).json(response);
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
              for (let i = 0; i < docs.length; i++) {
                for (let j = 0; j < teachersName.length; j++) {
                  if (docs[i].idTeacher == teachersName[j]._id) {
                    docs[i].nameTeacher = teachersName[j].fullname;
                    break;
                  }
                }
              }
              const response = Response.successResponse(docs);
              return res.status(200).json(response);
            });
          }
        });
    else {
      return res.json({ success: 'fail', error: 'unknow error' });
    }
  });
});

router.post('/addCourse', authMiddewares, (req, res) => {
  User.findOne({ _id: req.user.id }).lean()
    .exec(function (error, doc) {
      if (error) {
        const response = Response.falseResponse(error);
        return res.status(200).json(response);
      }
      else {
        if (doc) {
          let newCourse = new Course({
            name: req.body.name,
            short_described: req.body.short_described,
            full_described: req.body.full_described,
            rating: 0,
            image_link: req.body.image_link,
            idTeacher: req.user.id,
            isFinish: false,
            view: 0,
            price: parseInt(req.body.price),
            category: req.body.category,
            review: [],
            feedBack: []
          }).save((err, doc) => {
            if (err) return res.json({ success: 'fail', error: 'k add duoc vao mongo' });
            else return res.json({ success: 'true', course: doc });
          });
        }
        else {
          const response = Response.falseResponse('User not exists');
          return res.status(200).json(response);
        }
      }
    });
});

router.post('/addCategory', authMiddewares, valid(validCategorySchema), async (req, res) => {
  if (req.user.type !== 3) {
    const response = Response.falseResponse('User has no permissions');
    return res.status(200).json(response);
  }

  const checkCategory = await CategoryModel.findCategoryByName(req.body.name);

  if (checkCategory) {
    const response = Response.falseResponse('Category already exists');
    return res.status(200).json(response);
  }

  const user = await UserModel.findUserById(req.user.id);

  if (user) {
    const category = await CategoryModel.addCategory(req.body);
    const response = Response.successResponse(category);
    return res.status(200).json(response);
  }
  else {
    const response = Response.falseResponse('User not exists');
    return res.status(200).json(response);
  }
});

router.delete('/categoryByName', authMiddewares, async (req, res) => {
  if (req.user.type !== 3) {
    const response = Response.falseResponse('User has no permissions');
    return res.status(200).json(response);
  }

  const user = await UserModel.findUserById(req.user.id);

  if (user) {
    const del = await CategoryModel.deleteByName(req.body.name);
    if (del) {
      const response = Response.successResponse({ msg: "Delete success" });
      return res.status(200).json(response);
    }
    const response = Response.falseResponse('Delete fail');
    return res.status(200).json(response);
  }
  else {
    const response = Response.falseResponse('User not exists');
    return res.status(200).json(response);
  }
});

router.delete('/categoryById', authMiddewares, async (req, res) => {
  if (req.user.type !== 3) {
    const response = Response.falseResponse('User has no permissions');
    return res.status(200).json(response);
  }

  const user = await UserModel.findUserById(req.user.id);

  if (user) {
    const del = await CategoryModel.deleteById(req.body.id);
    if (del) {
      const response = Response.successResponse({ msg: "Delete success" });
      return res.status(200).json(response);
    }
    const response = Response.falseResponse('Delete fail');
    return res.status(200).json(response);
  }
  else {
    const response = Response.falseResponse('User not exists');
    return res.status(200).json(response);
  }
});

router.put('/category', authMiddewares, async (req, res) => {
  if (req.user.type !== 3) {
    const response = Response.falseResponse('User has no permissions');
    return res.status(200).json(response);
  }

  const user = await UserModel.findUserById(req.user.id);

  if (user) {
    const data = await CategoryModel.updateCategory(req.body);
    const response = Response.successResponse(data);
    return res.status(200).json(response);
  }
  else {
    const response = Response.falseResponse('User not exists');
    return res.status(200).json(response);
  }
});

router.post('/user/joinCourse', authMiddewares, async (req, res) => {
  if (req.user.type !== 1) {
    const response = Response.falseResponse('User has no permissions');
    return res.status(200).json(response);
  }

  const user = await UserModel.findUserById(req.user.id);
  if (user) {
      const data = await UserModel.joinCourse(user._id, req.body.idcourse);
      delete data.password;
      const response = Response.successResponse(data);
      return res.status(200).json(response);
  }
  else {
    const response = Response.falseResponse('User not exists');
    return res.status(200).json(response);
  }
});

router.get('/search/:text/:pageNumber/:limitPerPage', courseController.searchCourseEndPoint);

router.get('/getBestCourses', (req, res) => {
  Course.find({})
    .sort({ price: -1 })// sắp xếp giảm dần theo price
    .limit(5)// lấy nhiều nhất 5 item
    .lean()
    .exec(function (error, docs) {
      if (error) {
        const response = Response.falseResponse(error);
        return res.status(304).json(response);
      }
      else {
        console.log(docs.length);
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
          const response = Response.successResponse(docs);
          return res.status(200).json(response);
        });
      }
    });
});

router.get('/teacherCourse/:idTeacher',(req,res)=>{
  Course.find({idTeacher:req.params.idTeacher})
    .lean()
    .exec(function (error, docs) {
      if (error) {
        const response = Response.falseResponse(error);
        return res.status(304).json(response);
      }
      else {
        console.log(docs.length)
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
          const response = Response.successResponse(docs);
          return res.status(200).json(response);
        });
      }
    });
})

router.get('/getCourseByCategoryName/:name/:pageNumber/:limitPerPage', (req, res) => {
  let perPage = parseInt(req.params.limitPerPage)
  let page = Math.max(1, req.params.pageNumber)

  Course.find({ category: req.params.name },
    '_id name rating image_link dateCourse isFinish view price newPrice category idTeacher review')
    .lean()
    .exec(function (error, docs) {
      if (error) {
        const response = Response.falseResponse(error);
        return res.status(304).json(response);
      }
      else {
        let pageMax = Math.floor(docs.length / perPage);
		    if (docs.length / perPage != pageMax) pageMax +=1;
        const data = [];
		    for (let i = 0; i < perPage && i + perPage * (page-1) < docs.length; i++) {
          data[i] = docs[i + perPage * (page	-1)];
        }
        let teacherId = [];
        for (let i = 0; i < data.length; i++) {
          teacherId.push(data[i].idTeacher);
        }
        User.find({
          '_id': {
            $in: teacherId
          }
        }).select('fullname').exec(function (err, teachersName) {
          for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < teachersName.length; j++) {
              if (data[i].idTeacher == teachersName[j]._id) {
                data[i].nameTeacher = teachersName[j].fullname;
                break;
              }
            }
          }
          const response = Response.successResponse({course: data, pageMax: pageMax});
          return res.status(200).json(response);
        });
      }
    });
})

router.get('/myUpLoadCourse', authMiddewares,(req,res)=>{
  Course.find({idTeacher:req.user.id})
    .lean()
    .exec(function (error, docs) {
      if (error) {
        const response = Response.falseResponse(error);
        return res.status(304).json(response);
      }
      else {
        console.log(docs.length)
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
          const response = Response.successResponse(docs);
          return res.status(200).json(response);
        });
      }
    });
})


router.get('/banCourse/:idCourse',(req,res)=>{
   Course.findOneAndDelete({_id:req.params.idCourse})
    .lean()
    .exec(function (error, doc) {
      if(doc){
      let blackCourseSchema=new BlackCourse(doc).save();
      return res.json(doc)
      }else{
         res.json({err:'not found document'})
      }
    });
})

router.post('/updateCourse/:idCourse',(req,res)=>{
  Course.findOne({_id:req.params.idCourse})
    .exec(function (error, doc) {
      if(doc){
      for(const p in req.body){
        doc[p]=req.body[p];
      }
      doc.save();
      return res.json(doc)
      }else{
         res.json({err:'not found document'})
      }
    });
});

router.get('/isFinsh/:idCourse',(req,res)=>{
  Course.findOne({_id:req.params.idCourse})
    .exec(function (error, doc) {
      if(doc){
        doc.isFinish=true;
      doc.save();
      return res.json(doc)
      }else{
         res.json({err:'not found document'})
      }
    });
});

router.get('/sale', async (req, res) => {
  const course = await Course.find({},
    '_id name rating image_link dateCourse isFinish view price newPrice category idTeacher joinWeek')
    .sort({ newPrice: 1 }).lean().exec();
  if (course) {
    let data = [];
    for (let i = 0; i < course.length; i++) {
      if (course[i].newPrice === -1) continue;
      data.push(course[i]);
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
    const response = Response.successResponse(data);
    res.status(200).json(response);
  }
  else {
    const response = Response.falseResponse('Some thing wrong');
    return res.status(304).json(response);
  }
})

module.exports = router;
