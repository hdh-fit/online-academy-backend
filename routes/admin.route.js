const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
let db_user=[
   {
      "id":"user_0",
      "username":"admin",
      "fullname":"admin",
      "password":"123456",
      "phone":"123456789",
      "type":"1",
      "gender":"male",
      "dob":"20/01/2000",
      "describe":"là admin",
      "level":"Thạc sĩ",
      "email":"admin@gmail.com"
   },
   {
      "id":"user_1",
      "username":"nguyenvana",
      "fullname":"Nguyễn Văn A",
      "password":"123456",
      "phone":"123456789",
      "type":"2",
      "gender":"male",
      "dob":"20/01/2000",
      "describe":"là giảng viên trường A",
      "level":"Tiến sĩ",
      "email":"nguyenvana@gmail.com"
   },
   {
      "id":"user_2",
      "username":"nguyenvanb",
      "fullname":"Nguyễn Văn B",
      "password":"123456",
      "phone":"123456789",
      "type":"2",
      "gender":"male",
      "dob":"20/01/2000",
      "describe":"là giảng viên trường B",
      "level":"Tiến sĩ",
      "email":"nguyenvanb@gmail.com"
   },
   {
      "id":"user_3",
      "username":"nguyenthic",
      "fullname":"Nguyễn Thi C",
      "password":"123456",
      "phone":"123456789",
      "type":"3",
      "gender":"female",
      "dob":"20/01/2000",
      "describe":"Học viên trường KHTN",
      "level":"Đại Học",
      "email":"nguyenthic@gmail.com"
   },
   {
      "id":"user_4",
      "username":"nguyenthid",
      "fullname":"Nguyễn Thi D",
      "password":"123456",
      "phone":"123456789",
      "type":"3",
      "gender":"female",
      "dob":"20/01/2000",
      "describe":"Học viên trường Bách Khoa",
      "level":"Đại Học",
      "email":"nguyenthiD@gmail.com"
   },
   {
      "id":"user_5",
      "username":"nguyenvane",
      "fullname":"Nguyễn Văn E",
      "password":"123456",
      "phone":"123456789",
      "type":"3",
      "gender":"male",
      "dob":"20/01/2001",
      "describe":"Học viên trường CNTT",
      "level":"Đại Học",
      "email":"nguyenvane@gmail.com"
   }]
let db_course=[{
  id:'course_0',
  name:'khóa học nodejs',
  short_described:'Node.js là một hệ thống phần mềm được thiết kế để viết các ứng dụng internet có khả năng mở rộng, đặc biệt là máy chủ web. ',
  full_described:'Node.js là một hệ thống phần mềm được thiết kế để viết các ứng dụng internet có khả năng mở rộng, đặc biệt là máy chủ web.[1] Chương trình được viết bằng JavaScript, sử dụng kỹ thuật điều khiển theo sự kiện, nhập/xuất không đồng bộ để tối thiểu tổng chi phí và tối đa khả năng mở rộng.[2] Node.js bao gồm có V8 JavaScript engine của Google, libUV, và vài thư viện khác.',
  rating:4.3,
  image_link:'https://tedu.com.vn/uploaded/images/path/102020/nodejs.png',
  idTeacher:'user_1',
  dateCourse:'20/07/2021',
  isFinish:true,
  view:120,
  price:15000,
  category:'CNTT'
 },{
  id:'course_1',
  name:'khóa học reactjs',
  short_described:'React là một thư viện JavaScript front-end mã nguồn mở miễn phí để xây dựng giao diện người dùng hoặc các thành phần UI. Nó được duy trì bởi Facebook và một cộng đồng các nhà phát triển và công ty cá nhân.',
  full_described:'React (also known as React.js or ReactJS) is a free and open-source front-end JavaScript library[3] for building user interfaces or UI components. It is maintained by Facebook and a community of individual developers and companies.[4][5][6] React can be used as a base in the development of single-page or mobile applications. However, React is only concerned with state management and rendering that state to the DOM, so creating React applications usually requires the use of additional libraries for routing, as well as certain client-side functionality.',
  rating:4.0,
  image_link:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1024px-React-icon.svg.png',
  idTeacher:'user_1',
  dateCourse:'20/07/2021',
  isFinish:false,
  view:100,
  price:20000,
  category:'CNTT'
 },{
  id:'course_2',
  name:'khóa học html',
  short_described:'HTML là một ngôn ngữ đánh dấu được thiết kế ra để tạo nên các trang web trên World Wide Web. Nó có thể được trợ giúp bởi các công nghệ như CSS và các ngôn ngữ kịch bản giống như JavaScript.',
  full_described:'HTML (viết tắt của từ Hypertext Markup Language, hay là "Ngôn ngữ Đánh dấu Siêu văn bản") là một ngôn ngữ đánh dấu được thiết kế ra để tạo nên các trang web trên World Wide Web. Nó có thể được trợ giúp bởi các công nghệ như CSS và các ngôn ngữ kịch bản giống như JavaScript.HTML HTML độngHTML5 HTML5 audioCanvasHTML5 videoXHTML XHTML BasicXHTML Mobile ProfileI-modePhần tử HTML Span and divHTML attributeFrame (World Wide Web)Trình biên tập HTMLCharacter encodings in HTML Unicode and HTMLMã ngôn ngữDOMBrowser Object ModelStyle sheet (web development)s CSSFont family (HTML)Web colorsHTML scriptingJavaScript WebGLWebCLW3C W3C Markup Validation ServiceWHATWGQuirks modeWeb storageBrowser engine Comparison of document-markup languagesComparison of browser engines (HTML support)Comparison of layout engines (XHTML) Comparison of layout engines (XHTML 1.1) Các trình duyệt web nhận tài liệu HTML từ một web server hoặc một kho lưu trữ cục bộ và render tài liệu đó thành các trang web đa phương tiện. HTML mô tả cấu trúc của một trang web về mặt ngữ nghĩa và các dấu hiệu ban đầu được bao gồm cho sự xuất hiện của tài liệu.',
  rating:3,
  image_link:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/HTML5_logo_resized.svg/200px-HTML5_logo_resized.svg.png',
  idTeacher:'user_2',
  dateCourse:'20/07/2020',
  isFinish:false,
  view:100,
  price:10000,
  category:'CNTT'
}];
let db_video=[
  {
  id:'video_0',
  name:'Giới thiệu về nodejs',
  id_course:'course_0',
  link:'https://cdn.videvo.net/videvo_files/video/free/2020-04/small_watermarked/200401_Medical%206_01_preview.webm'},
   {
  id:'video_1',
  name:'khởi tạo dự án nodejs',
  id_course:'course_0',
  link:'https://cdn.videvo.net/videvo_files/video/free/2020-04/small_watermarked/200401_Microscope%205_05_preview.webm'},
  {
  id:'video_0',
  name:'giới thiệu reactjs',
  id_course:'course_1',
  link:'https://cdn.videvo.net/videvo_files/video/free/2020-04/small_watermarked/200401_Microscope%205_01_preview.webm'}
];

//lấy danh sách category
router.get('/category/all', async function (req, res) {
  let categories=['CNTT'];
  res.status(201).json(categories);
})

//xem danh sách khóa học 
router.get('/course/all',(req,res)=>{
  let list=[];
  for(let i=0;i<db_course.length;i++){
    let course={
      id:db_course[i].id,
      name:db_course[i].name,
      short_described:db_course[i].short_described,
      image_link:db_course[i].image_link
    }
    list.push(course);
  }
   res.status(201).json(list);
})

//xem chi tiết khóa học 
router.get('/course/detail/:id',(req,res)=>{  
  for(let i=0;i<db_course.length;i++){
    if(db_course[i].id==req.params.id){
     return res.status(201).json(db_course[i]);
    }
  }
   res.status(404).json({err:'no item with this provided id'});
})

//xem danh sách giáo viên 
router.get('/teacher/all',(req,res)=>{  
  let list=[];
  for(let i=0;i<db_user.length;i++){
    if(db_user[i].type=='2'){
     list.push(db_user[i])
    }
  }
  res.status(201).json(list);
})

//xem chi tiết giáo viên dựa vào id
router.get('/teacher/detail/:id',(req,res)=>{  
  for(let i=0;i<db_user.length;i++){
    if(db_user[i].id==req.params.id){
     return res.status(201).json(db_user[i]);
    }
  }
   res.status(404).json({err:'no teacher with this provided id'});
})

module.exports = router;