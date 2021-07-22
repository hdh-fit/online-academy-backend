const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('express-async-errors');


const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());


//người dùng hệ admin //quản trị viên
app.use('/api/admin', require('./routes/admin.route'));
//người dùng là giảng viên
app.use('/api/teacher', require('./routes/teacher.route'));
//người dùng là học viên
app.use('/api/user', require('./routes/user.route'));
//người dùng là ẩn danh
app.use('/api/anonymous', require('./routes/anonymous.route'));

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