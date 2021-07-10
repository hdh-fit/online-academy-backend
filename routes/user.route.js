const express = require('express');
const usermodel = require('../models/user.model');

const router = express.Router();

router.post('/register', 
    async (req, res) => {
        const user = await usermodel.getUserByName(req.body.username);

        if (user != null){
            return res.status(204).end();
        }

        const newuser = await usermodel.registerUser(req.body);

        if (newuser == null)  {
            return res.status(204).end();
        }
        res.status(200).json(newuser);
    })

module.exports = router;