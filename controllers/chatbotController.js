const PAGE_ACCESS_TOKEN = "EAAEmxh3ScykBAEcnImYCo0JSt4VM1uEch0hDcQshZBhD01UPWdFMxhZAzq9DnWc2ZBmDHPOw5IFt4KV0WHXmFJKZCO6kWsGHDNu8d9xhB34xapOpFmGHRdAAZAhfPKeVJLoH0ZAFtA2brdk70tgggEYsaKEnVoHWFXRzQ4buQkUieDWc250CrB";
const VERIFY_TOKEN = "EAAEmxh3ScykBAF4NrvKNSuLdFuJJibAuZBvef0YlyL2NNo7ny6mjkpCDa4lwPwUsIQHWtdLJ8aZBmeDCwHLpgL3H8XzdxGIbrFSscpCXb4quqRxUP7LwsGZCHynOd5jWnGbMR2AsCerS0ofhWgCLVOOEetoaaT9AizqK2hF5a1cY4oZAuKGr";
const request = require('request');

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
			let sender_psid = webhook_event.sender.id;
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

	// Check if the message contains text
	if (received_message.text) {

		// Create the payload for a basic text message
		response = {
			"text": `You sent the message: "${received_message.text}". Now send me an image!`
		};
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
	}

	// Sends the response message
	callSendAPI(sender_psid, response);
};

// Handles messaging_postbacks events
const handlePostback = (sender_psid, received_postback) => {
	let response;

	// Get the payload for the postback
	let payload = received_postback.payload;

	// Set the response based on the postback payload
	if (payload === 'yes') {
		response = { "text": "Thanks!" };
	} else if (payload === 'no') {
		response = { "text": "Oops, try sending another image." };
	}
	// Send the message to acknowledge the postback
	callSendAPI(sender_psid, response);
};

// Sends response messages via the Send API
const callSendAPI = (sender_psid, response) => {
	// Construct the message body
	let request_body = {
		"recipient": {
			"id": sender_psid
		},
		"message": response
	};
	console.log('request_body', request_body);

	// Send the HTTP request to the Messenger Platform
	request({
		"uri": "https://graph.facebook.com/v2.6/me/messages",
		"qs": { "access_token": PAGE_ACCESS_TOKEN },
		"method": "POST",
		"json": request_body
	}, (err, res, body) => {
		if (!err) {
			console.log('message sent!');
		} else {
			console.error("Unable to send message:" + err);
		}
	});
};

module.exports = {
	postWebHook,
	getWebHook
};
