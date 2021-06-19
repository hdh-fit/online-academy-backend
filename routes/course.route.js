const express = require('express');
const coursemodel = require('../models/course.model');

const router = express.Router();

router.get('/', 
    async (req, res) => {
        const list = await coursemodel.getall();

        res.json(list);
    })

router.get('/:id', 
    async (req, res)  => {
        const id = req.params.id || 0;
        const course = await coursemodel.findById(id);

        if (course == null) return res.status(204).end();

        res.json(course);
    })

router.delete('/:id', 
    async (req, res) =>{
        const id = req.params.id || 0;
        const course = await coursemodel.deleteById(id);

        if (course == null) return res.status(204).end();

        res.status(200).end();
    })

router.put('/:id', 
    async (req, res) => {
        const course = req.body;
        const id = req.params.id || 0;
        
        const checkcourse = await coursemodel.findById(id);
        if (checkcourse == null) return res.status(204).end();
        
        await coursemodel.updateById(id, course);
        
        res.status(200).json(course);
    })

module.exports = router;