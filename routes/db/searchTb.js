const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const SearchTb = require('../../models/searchTb.model');
router.get('/', (req, res, next) => {
  SearchTb.find()
    .exec()
    .then(docs => {
        res.status(200).json(response);
    }).catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

module.exports = router;