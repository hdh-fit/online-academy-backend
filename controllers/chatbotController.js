const PAGE_ACCESS_TOKEN = "EAAEmxh3ScykBAFmJj1NSEZByLzrvEiSAvGtQMWxWng3CkOZAnKd8wcZBuFvn20i8YaaKE5DELRgVf5YmXS9bRUEy6NLqT3sSC33vorNAXIjV6yIB7a4jsMVZAHIQd8gN31BL9KW6F473NjmuE1vGBAAvFd99sAe5iIh2o8xohiZBpqeUFuzi0";
const VERIFY_TOKEN = "EAAEmxh3ScykBAF4NrvKNSuLdFuJJibAuZBvef0YlyL2NNo7ny6mjkpCDa4lwPwUsIQHWtdLJ8aZBmeDCwHLpgL3H8XzdxGIbrFSscpCXb4quqRxUP7LwsGZCHynOd5jWnGbMR2AsCerS0ofhWgCLVOOEetoaaT9AizqK2hF5a1cY4oZAuKGr";

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

};

// Handles messaging_postbacks events
const handlePostback = (sender_psid, received_postback) => {

};

// Sends response messages via the Send API
const callSendAPI = (sender_psid, response) => {

};

module.exports = {
	postWebHook,
	getWebHook
};
