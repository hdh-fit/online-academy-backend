const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('express-async-errors');


const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());



app.use('/api/', require('./routes/api.route'));
app.use('/', require('./routes/chatbot.route'));


app.use(function (req, res, next) {
  res.status(404).send({
    error_message: 'Endpoint not found!'
  })
});

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send({
    error_message: 'Something broke!'
  });
});

const PORT = process.env.PORT || 3030;
app.listen(PORT, function () {
  setInterval(()=>{
    process.exit(0)
  },25*60*1000)
});

const { Course } = require("./models/course_model");
const date = new Date();
const day = date.getDay();
const hours = date.getHours();
const minutes = date.getMinutes();
console.log(day);
console.log(hours);
console.log(minutes);
if (day === 1 && hours === 3 && minutes > 35) {
  resetWeekly();
}

async function resetWeekly() {
  const course = await Course.find({}).exec();
  if (course){
    for (let i = 0; i < course.length; i++) {
      course[i].joinWeek = 0;
      await course[i].save();
    }
  }
}