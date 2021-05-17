const express  = require('express');
const router   = express.Router();
const AdminTagTb = require('../../models/adminTagTb.model');
router.get('/region', (req, res, next) => {
  AdminTagTb.find()
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            adminTagTbs: docs.map(doc => {
                return {
                    _id: doc._id,
                    adminTag: doc.adminTag.regionTag,
                }
            })
        };
        res.status(200).json(response);
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});
  module.exports = router;