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

router.get('/info',
    require("../middlewares/auth.mdw"),
    async (req, res) => {
        const user = await usermodel.getUserById(req.accessTokenPayload);

        res.status(200).json(user);
    })

router.put('/info', 
    require("../middlewares/auth.mdw"),
    async (req, res) => {
        const id = req.accessTokenPayload.userid;
        const user = await usermodel.getUserById(id);

        if (user == null) {
            return res.status(204).end();
        }

        await usermodel.updateUser(id, req.body);
        res.status(200).json(req.body);
    })

router.put('/updatepassword', 
    require("../middlewares/auth.mdw"),
    async (req, res) => {
        const id = req.accessTokenPayload.userid;
        const user = await usermodel.getUserById(id);
        const validPassword = await usermodel.validPassword(user, req.body.password);

        if (validPassword) {
            await usermodel.updatePassword(id, req.body.newpassword);
            delete req.body.password;
            delete req.body.newpassword;
            res.status(200).json(req.body);
        }

        res.status(204).end();
    })
module.exports = router;