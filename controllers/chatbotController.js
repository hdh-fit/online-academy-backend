require("dotenv").config();
const PAGE_TOKEN = process.env.PAGE_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const MONGODB_URL = process.env.MONGO_URL;
const Response = require('../jsonResponse/jsonResponse');
const request = require('request');
const mongoose = require('mongoose');
const { Course } = require("../models/course_model");
const { Category } = require("../models/category.model");
const { getCourseByCategoryName, searchCourse, getCourseById } = require("./courseController");
mongoose.connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });

const optionsResponse = {
	"attachment": {
		"type": "template",
		"payload": {
			"template_type": "generic",
			"elements": [
				{
					"title": "Welcome!",
					"image_url": "https://cafedev.vn/wp-content/uploads/2020/05/cafedevn_css.jpg",
					"subtitle": "Chào mừng bạn đến với FIT Study <3",
					"default_action": {
						"type": "web_url",
						"url": "https://fitstudy.netlify.app",
						"webview_height_ratio": "tall"
					},
					"buttons": [
						{
							"type": "postback",
							"payload": "search",
							"title": "Tìm kiếm khoá học"
						},
						{
							"type": "postback",
							"title": "Duyệt theo danh mục",
							"payload": "main-category"
						},
					]
				}
			]
		}
	}
};

const searchOptions = {
	"text": `Vui lòng gửi từ khoá cần tìm kiếm theo cú pháp @<X> với X là từ khoá cần tìm kiếm. Ví dụ: @android.`
};


const postWebHook = (req, res) => {
	let body = req.body;

	// Checks this is an event from a page subscription
	if (body.object === 'page') {

		// Iterates over each entry - there may be multiple if batched
		body.entry.forEach(function (entry) {
			// Gets the body of the webhook event
			let webhook_event = entry.messaging[0];
			console.log(webhook_event);

			// Get the sender PSID
			let sender_psid = webhook_event.sender?.id || webhook_event.sender?.user_ref;
			console.log('Sender PSID: ' + sender_psid);

			// Check if the event is a message or postback and
			// pass the event to the appropriate handler function
			if (webhook_event.message) {
				handleMessage(sender_psid, webhook_event.message);
			} else if (webhook_event.postback) {
				handlePostback(sender_psid, webhook_event.postback);
			}
		});

		// Returns a '200 OK' response to all requests
		res.status(200).send('EVENT_RECEIVED');
	} else {
		// Returns a '404 Not Found' if event is not from a page subscription
		res.sendStatus(404);
	}
};

const getWebHook = (req, res) => {
	// Your verify token. Should be a random string.

	// Parse the query params
	let mode = req.query['hub.mode'];
	let token = req.query['hub.verify_token'];
	let challenge = req.query['hub.challenge'];

	// Checks if a token and mode is in the query string of the request
	if (mode && token) {

		// Checks the mode and token sent is correct
		if (mode === 'subscribe' && token === VERIFY_TOKEN) {

			// Responds with the challenge token from the request
			console.log('WEBHOOK_VERIFIED');
			res.status(200).send(challenge);

		} else {
			// Responds with '403 Forbidden' if verify tokens do not match
			res.sendStatus(403);
		}
	}
};

// Handles messages events
const handleMessage = (sender_psid, received_message) => {
	let response;
	const messText = received_message.text;

	if (messText) {
		if (messText[0] === '@') {
			const searchKey = messText.slice(1);

			Course.find({ name: { $regex: new RegExp(searchKey, 'i') } }).lean().exec((err, docs) => {
				const elements = docs.map(course => (
					{
						title: course.name,
						image_url: course.image_link,
						subtitle: course.short_described,
						default_action: {
							type: "web_url",
							url: `https://fitstudy.netlify.app/course/${course._id}`,
							webview_height_ratio: "tall"
						},
						buttons: [
							{
								type: "postback",
								payload: `idCourse_${course._id}`,
								title: "Xem chi tiết khoá học"
							}
						]
					}
				));

				if (err || elements.length === 0) {
					response = { text: 'Không tìm thấy kết quả phù hợp.' };
				} else {
					response = {
						"attachment": {
							"type": "template",
							"payload": {
								"template_type": "generic",
								"elements": elements
							}
						}
					};
				}
				callSendAPI(sender_psid, response);
			});

		} else {
			if (received_message.quick_reply) {
				const replyArr = received_message.quick_reply.payload.split('_');
				if (replyArr.length === 2) {
					getCategories()
						.then(res => {
							const quick_replies = res.filter(item => item.category === replyArr[1]).map(category => (
								{
									"content_type": "text",
									"title": category.label,
									"payload": category.name,
								}
							));

							response = {
								text: "Xin chọn lĩnh vực:",
								quick_replies
							};

							callSendAPI(sender_psid, response);
						});
				} else {
					getCourseByCategoryName(received_message.quick_reply.payload)
						.then(courses => {
							const elements = courses.map(course => (
								{
									title: course.name,
									image_url: course.image_link,
									subtitle: course.short_described,
									default_action: {
										type: "web_url",
										url: `https://fitstudy.netlify.app/course/${course._id}`,
										webview_height_ratio: "tall"
									},
									buttons: [
										{
											type: "postback",
											payload: `idCourse_${course._id}`,
											title: "Xem chi tiết khoá học"
										}
									]
								}
							));

							if (elements.length === 0) {
								response = { text: 'Không tìm thấy kết quả phù hợp.' };
							} else {
								response = {
									"attachment": {
										"type": "template",
										"payload": {
											"template_type": "generic",
											"elements": elements
										}
									}
								};
							}
							callSendAPI(sender_psid, response);
						})
						.catch(err => console.log(err));
				}
			} else {
				switch (messText) {
					case 'start':
						callSendAPI(sender_psid, optionsResponse);
						break;
					default:
						return;
				}
			}
		}
	} else if (received_message.attachments) {

		// Gets the URL of the message attachment
		let attachment_url = received_message.attachments[0].payload.url;
		response = {
			"attachment": {
				"type": "template",
				"payload": {
					"template_type": "generic",
					"elements": [{
						"title": "Is this the right picture?",
						"subtitle": "Tap a button to answer.",
						"image_url": attachment_url,
						"buttons": [
							{
								"type": "postback",
								"title": "Yes!",
								"payload": "yes",
							},
							{
								"type": "postback",
								"title": "No!",
								"payload": "no",
							}
						],
					}]
				}
			}
		};
		// Sends the response message
		callSendAPI(sender_psid, response);
	}
};

// Handles messaging_postbacks events
const handlePostback = async (sender_psid, received_postback) => {
	try {
		let response;
		let payload = received_postback.payload;

		const courseIdArr = payload.split('_');

		if (courseIdArr?.length === 2) {
			const res = await getCourseById(courseIdArr[1]);
			if (res) {
				const { name, rating, teacher, short_described, view, price, category, newPrice, listStudent } = res?.data;
				const text =
					`Course Name: ${name}\nView: ${view}\nPrive: ${newPrice !== -1 ? newPrice : price}\nRating: ${rating}\nStudents:${listStudent.length}\nInstructors: ${teacher.fullname}\nShort description: ${short_described}\nCategory: ${category}`;
				response = { text };
			} else {
				response = { text: 'Some thing wrong.' };
			}
		} else {
			switch (payload) {
				case 'start':
					response = optionsResponse;
					break;
				case 'search':
					response = searchOptions;
					break;
				//case 'category':
				//	const categories = await getCategories();

				//	const quick_replies = categories.map(category => (
				//		{
				//			"content_type": "text",
				//			"title": category.label,
				//			"payload": category.name,
				//		}
				//	));

				//	response = {
				//		text: "Xin chọn danh mục:",
				//		quick_replies
				//	};

				//	break;
				case 'main-category':
					const categories = await getCategories();
					const mainCategories = categories.map(category => category.category);

					const quick_replies = mainCategories.filter((item, index) => mainCategories.indexOf(item) === index).map(category => (
						{
							"content_type": "text",
							"title": category,
							"payload": `main_${category}`,
						}
					));

					response = {
						text: "Xin chọn danh mục:",
						quick_replies
					};

					break;
				default:
					response = { text: 'Some thing wrong.' };
					break;
			}
		}

		callSendAPI(sender_psid, response);
	} catch (error) {
		console.log(error);
	}

};

const getCategories = () => {
	return new Promise((resolve, reject) => {
		Category.find({}, (err, docs) => {
			if (err) {
				reject(err);
			} else {
				resolve(docs);
			}
		});
	});
};

// Sends response messages via the Send API
const callSendAPI = (sender_psid, response) => {
	// Construct the message body
	//let request_body = {
	//	"recipient": {
	//		"id": sender_psid
	//	},
	//	"message": response,
	//	"messaging_type": "RESPONSE",
	//};
	let request_body = {
		"messaging_type": "RESPONSE",
		"recipient": {
			"id": sender_psid
		},
		"message": response
	};

	console.log('request_body', request_body);

	// Send the HTTP request to the Messenger Platform
	request({
		"uri": `https://graph.facebook.com/v11.0/me/messages?access_token=${PAGE_TOKEN}`,
		"method": "POST",
		"json": request_body
	}, (err, res, body) => {
		console.log('body:', body);
		if (!err) {
			console.log('message sent!');
		} else {
			console.error("Unable to send message:" + err);
		}
	});
};

const testEndpoint = (req, res) => {
	const id = req.params.text;
	getCourseById(id).then(res => console.log(res)).catch((er) => console.log(er));

};

module.exports = {
	postWebHook,
	getWebHook,
	testEndpoint
};

