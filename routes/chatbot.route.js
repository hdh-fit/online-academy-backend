const express = require('express');
const router = express.Router();
const chatbotController = require("../controllers/chatbotController");

router.get("/webhook", chatbotController.getWebHook);
router.post("/webhook", chatbotController.postWebHook);
router.get("/check/:text", chatbotController.check);

module.exports = router;
