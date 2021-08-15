const bcrypt = require('bcryptjs');

const { Course } = require("./course_model");
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const userSchema = new mongoose.Schema({
    stt: String,
    fullname: String,
    username: String,
    password: String,
    phone: String,
    type: Number,
    gender: String,
    dob: Date,
    describe: String,
    level: String,
    email: String,
    watchlist: [String],
    listCourse: [String],
    disable: { type: Boolean, default: false }
});
const User = mongoose.model('User', userSchema);

module.exports = {
    User: mongoose.model('User', userSchema),

	findUserById(id) {
        return User.findById(id).lean().exec();
    },

    findUserByUsername(username) {
        return User.findOne({ username: username }).lean().exec();
    },

    findUserByEmail(email) {
        return User.findOne({ email: email }).lean().exec();
    },

    async addNewUser(user) {
        const newuser = new User(user);
        newuser.password = bcrypt.hashSync(newuser.password, 10);
        await newuser.save();
        return newuser.toObject();
    },

    async updateUser(id, user) {
        const updates = {
            fullname: user.fullname,
            phone: user.phone,
            gender: user.gender,
            dob: user.dob,
            describe: user.describe,
            level: user.level,
        }

        const data = await User.findOneAndUpdate(
            {_id: id}, 
            {$set: updates},
            { new: true }
        );

        return data;
    },

    async updateUserPassword(id, password) {
        const data = await User.findOneAndUpdate(
            {_id: id}, 
            {password: password}
        );

        return true;
    },

    async addWatchlist(id, idCourse) {
        const user = await User.findOne({ _id: id })
        if (user) {
            if (user.watchlist.indexOf(idCourse) > -1) {
                user.watchlist.pull(idCourse);
            }
            else user.watchlist.push(idCourse);
            await user.save();
            return user;
            }
        else {
            return false;
        }
    },

    async getWatchlist(id) {
        const user = await User.findOne({ _id: id })
        if (user) {
            const watchlist = await Course.find({
                '_id': {$in: user.watchlist}},
                '_id name rating image_link dateCourse isFinish view price category idTeacher')
                .lean()
                .exec();

            let teacherId = [];
            for (let i = 0; i < watchlist.length; i++) {
                teacherId.push(watchlist[i].idTeacher);
            }
            
            const teachersName = await User.find({'_id': {$in: teacherId}}).select('fullname').exec();
            for (let i = 0; i < watchlist.length; i++) {
                for (let j = 0; j < teachersName.length; j++) {
                    if (watchlist[i].idTeacher == teachersName[j]._id) {
                        watchlist[i].nameTeacher = teachersName[j].fullname;
                        break;
                    }
                }
            }
            return watchlist;
        }
        else {
            return false;
        }
    },

    getAllUser() {
        return User.find({},
            '_id fullname username phone type gender dob email')
            .lean()
            .exec();
    },

    getUserByType(type) {
        return User.find({type: type},
            '_id fullname username phone type gender dob email')
            .lean()
            .exec();
    },

    async deleteById(id) {
        const user = await User.findOne({_id: id});
        if(user && user.type !== 3) {
            const course = await Course.find({ listStudent: id });
            for (let i = 0; i < course.length; i++) {
                course[i].listStudent.pull(id);
                await course[i].save();
            }
            
            return User.deleteOne({ _id: id }).exec();
        }
        return false;
    },

    async joinCourse(id, idCourse) {
        const user = await User.findOne({ _id: id });
        const course = await Course.findOne({ _id: idCourse });
        if (user && course) {
            if (user.listCourse.indexOf(idCourse) > -1) {
                user.listCourse.pull(idCourse);
                course.listStudent.pull(id);
            }
            else {
                user.listCourse.push(idCourse);
                course.listStudent.push(id);
            }
            await user.save();
            await course.save();
            return user;
            }
        else {
            return false;
        }
    },

    async getCourselist(id) {
        const user = await User.findOne({ _id: id })
        if (user) {
            const listCourse = await Course.find({
                '_id': {$in: user.listCourse}},
                '_id name rating image_link dateCourse isFinish view price category idTeacher')
                .lean()
                .exec();

            let teacherId = [];
            for (let i = 0; i < listCourse.length; i++) {
                teacherId.push(listCourse[i].idTeacher);
            }
            
            const teachersName = await User.find({'_id': {$in: teacherId}}).select('fullname').exec();
            for (let i = 0; i < listCourse.length; i++) {
                for (let j = 0; j < teachersName.length; j++) {
                    if (listCourse[i].idTeacher == teachersName[j]._id) {
                        listCourse[i].nameTeacher = teachersName[j].fullname;
                        break;
                    }
                }
            }
            return listCourse;
        }
        else {
            return false;
        }
    },

    async disableUser(id) {
        const user = await User.findOne({_id: id});
        if(user && user.type !== 3) {
            user.disable = true;
            await user.save();
            return true;
        }
        else return false;
    },
};