require("dotenv").config();
const PAGE_TOKEN = process.env.PAGE_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const MONGODB_URL = process.env.MONGO_URL;
const Response = require('../jsonResponse/jsonResponse');
const request = require('request');
const mongoose = require('mongoose');
const { Course } = require("../models/course_model");
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
							"payload": "category"
						},
					]
				}
			]
		}
	}
};

const searchOptions = {
	"text": `Vui lòng gửi từ khoá cần tìm kiếm.`
};

const searchResponse = {
	"attachment": {
		"type": "template",
		"payload": {
			"template_type": "generic",
			"elements": [
				{
					"title": "Khoá học HTML",
					"image_url": "https://codebrainer.azureedge.net/images/what-is-html.jpg",
					"subtitle": "Nguyễn Thị B",
					"default_action": {
						"type": "web_url",
						"url": "https://fitstudy.netlify.app/course/60febcd46d6d78006fab4d93",
						"webview_height_ratio": "tall"
					},
					"buttons": [
						{
							"type": "web_url",
							"url": "https://fitstudy.netlify.app/course/60febcd46d6d78006fab4d93",
							"title": "Xem chi tiết khoá học"
						}
					]
				},
				{
					"title": "Lập trình NodeJs cơ bản",
					"image_url": "https://tuanntblog.com/wp-content/uploads/2018/11/nodejs-new-pantone-black.png",
					"subtitle": "Nguyễn Thị B",
					"default_action": {
						"type": "web_url",
						"url": "https://fitstudy.netlify.app/course/60febcd46d6d78006fab4d90",
						"webview_height_ratio": "tall"
					},
					"buttons": [
						{
							"type": "web_url",
							"url": "https://fitstudy.netlify.app/course/60febcd46d6d78006fab4d90",
							"title": "Xem chi tiết khoá học"
						}
					]
				},
				{
					"title": "Khóa học JavaScript",
					"image_url": "https://wiki.tino.org/wp-content/uploads/2020/10/JS-750x375.jpg",
					"subtitle": "Nguyễn Thị B",
					"default_action": {
						"type": "web_url",
						"url": "https://fitstudy.netlify.app/course/60febcd46d6d78006fab4d95",
						"webview_height_ratio": "tall"
					},
					"buttons": [
						{
							"type": "web_url",
							"url": "https://fitstudy.netlify.app/course/60febcd46d6d78006fab4d95",
							"title": "Xem chi tiết khoá học"
						}
					]
				}
			]
		}
	}
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
								type: "web_url",
								url: `https://fitstudy.netlify.app/course/${course._id}`,
								title: "Xem chi tiết khoá học"
							}
						]
					}
				));

				const response = {
					"attachment": {
						"type": "template",
						"payload": {
							"template_type": "generic",
							"elements": elements
						}
					}
				};

				callSendAPI(sender_psid, response);
			});

		} else {
			switch (messText) {
				case 'start':
					callSendAPI(sender_psid, optionsResponse);
					break;
				default:
					return;
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
const handlePostback = (sender_psid, received_postback) => {
	let response;

	// Get the payload for the postback
	let payload = received_postback.payload;
	switch (payload) {
		case 'start':
			response = optionsResponse;
			break;
		case 'search':
			response = searchOptions;
			break;
		case 'category':
			response = optionsResponse;
			break;
		default:
			break;
	}

	callSendAPI(sender_psid, response);
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

const check = (req, res) => {
	const searchKey = req.params.text;

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
						type: "web_url",
						url: `https://fitstudy.netlify.app/course/${course._id}`,
						title: "Xem chi tiết khoá học"
					}
				]
			}
		));

		const response = {
			"attachment": {
				"type": "template",
				"payload": {
					"template_type": "generic",
					"elements": elements
				}
			}
		};

		res.status(200).json(response);
	});
};

module.exports = {
	postWebHook,
	getWebHook,
	check
};

