const express = require('express');
const router = express.Router();
const authMiddewares = require('../middlewares/auth.mdw');
const chatbotController = require("../controllers/chatbotController");

router.get("/webhook", chatbotController.getWebHook);
router.post("/webhook", chatbotController.postWebHook);

module.exports = router;
