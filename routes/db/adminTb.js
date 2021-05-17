const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const AdminTb = require('../../models/adminTb.model');
router.get('/', (req, res, next) => {
  AdminTb.find()
    // .select("name price _id")
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            adminTbs: docs.map(doc => {
                return {
                    _id: doc._id,
                    userId: doc.userId,
                    password: doc.password,
                    nickname: doc.nickname,
                    loginToken: doc.loginToken,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/adminTb/' + doc.userId
                    }
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

router.post('/', (req, res, next) => {
    const adminTb = new AdminTb({
        _id: new mongoose.Types.ObjectId(),
        userId: req.body.userId,
        password: req.body.password,
        nickname: req.body.nickname,
        loginToken: req.body.loginToken
    });
    adminTb.save()
    .then(result => {
        console.log(result);
        res.status(201).json({
            message: 'Created adminTb successfully',
            createdAdminId: {
                _id: result._id,
                userId: result.userId,
                password: result.password,
                nickname: result.nickname,
                loginToken: result.loginToken,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products/' + result._id
                }
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.get('/:adminId', (req, res, next) => {
    AdminTb.findOne({userId : req.params.adminId})
    // .select('name price _id')
    .exec()
    .then(doc => {
        console.log("From database", doc);
        if (doc) {
            res.status(200).json({
                adminTb: doc,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/adminTb'
                }
            });
        } else {
            res.status(404)
            .json({
                message: "No valid entry found for userId"
            })
        }
    }).catch(err => {
        console.log(err);
    });
});

// router.patch('/:adminId', (req, res, next) => {
//     const updateOps = {};
//     for(const ops of req.body) {
//         updateOps[ops.propName] = ops.value
//     }
//     AdminTb.update({userId : req.params.userId}, { $set: updateOps })
//     .exec()
//     .then(result => {
//         res.status(201).json({
//             message: 'AdeminTb updated',
//             request: {
//                 type: 'GET',
//                 url: 'http://localhost:3000/adminTb' + userId
//             }
//         });
//     }).catch(err => {
//         console.log(err);
//         res.status(500).json({
//             error: err
//         });
//     });
// });

// router.delete('/:userId', (req, res, next) => {
//     AdminTb.remove({userId : req.params.userId})
//     // const id = req.params.productId;
//     // UserTb.remove({_id: id})
//     .exec()
//     .then(result => {
//         res.status(200).json({
//             message: 'AdminTb deleted',
//             request: {
//                 type: 'POST',
//                 url: 'http://localhost:3000/adminTb/',
//                 // body: { name: 'String', price: 'Number' }
//             }
//         })
//     }).catch(err => {
//         console.log(err);
//         res.status(500).json({
//             error: err
//         });
//     });
// });

module.exports = router;