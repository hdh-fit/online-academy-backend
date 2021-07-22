const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

router.get('/', async function (req, res) {
  const user = {ten:"Duy",ho:"Vu"}
  res.status(201).json(user);
})

module.exports = router;