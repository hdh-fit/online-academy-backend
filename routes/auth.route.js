const express = require('express');
const usermodel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/', 
    async (req, res) => {
        const user = await usermodel.getUserByName(req.body.username);

        if (user == null){
            return res.json({
                authenticated: false
            });
        }

        if (!bcrypt.compareSync(req.body.password, user.password)){
            return res.json({
                authenticated: false
            });
        }

        const payload = {
            userid: user.id
        }

        const opts = {
            expiresIn: 36000
        }

        const accessToken = jwt.sign(payload, 'WEDNC2021', opts);
        //const refreshToken = '';
        

        return res.json({
            authenticated: true,
            accessToken: accessToken
        });
    })

module.exports = router;