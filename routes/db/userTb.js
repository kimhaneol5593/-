const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const UserTb = require('../../models/userTb.model');
const algo = require("./algo")

// router.get('/', (req, res, next) => {
//   UserTb.find()
//     .populate('folders.stores.ytbStoreTbId')
//     .populate('folders.stores.attractionTbId')
//     // .select("name price _id")  
//     .exec()
//     .then(docs => {
//         const response = {
//             count: docs.length,
//             userTbs: docs.map(doc => {
//                 return {
//                     _id: doc._id,
//                     userId: doc.userId,
//                     social: doc.social,
//                     nickname: doc.nickname,
//                     photoUrl: doc.photoUrl,
//                     memo: doc.memo,
//                     likeYoutuber: doc.likeYoutuber,
//                     likeFlows: doc.likeFlows,
//                     folders: doc.folders,
//                     request: {
//                         type: 'GET',
//                         url: 'http://localhost:3000/userTb/' + doc.userId
//                     }
//                 }
//             })
//         };
//         res.status(200).json(response);
//     }).catch(err => {
//         console.log(err);
//         res.status(500).json({
//             error: err
//         });
//     });
// });

router.get('/', async (req, res, next) => {
    try {
        algo.pagination(req, res, UserTb)
    } catch (err) {
        res.status(500).json({
            error : err
        })
    }
});

router.post('/', (req, res, next) => {
    const userTb = new UserTb({
        _id: new mongoose.Types.ObjectId(),
        userId: req.body.userId,
        social: req.body.social,
        nickname: req.body.nickname,
        photoUrl: req.body.photoUrl,
        memo: req.body.memo,
        likeYoutuber: req.body.likeYoutuber,
        likeFlows: req.body.likeFlows,
        loginToken: req.body.loginToken,
        folders: req.body.folders
    });
    userTb.save()
    .then(result => {
        console.log(result);
        res.status(201).json({
            message: 'Created userTb successfully',
            createdUserId: {
                _id: result._id,
                userId: result.userId,
                social: result.social,
                nickname: result.nickname,
                photoUrl: result.photoUrl,
                memo: result.memo,
                likeYoutuber: result.likeYoutuber,
                likeFlows: result.likeFlows,
                loginToken: req.body.loginToken,
                folders: result.folders,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/userTb/' + result.userId
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

// userId로 값 찾기
// router.get('/id/:userId', (req, res, next) => {
//     UserTb.find({userId : req.params.userId})
//     .exec()
//     .then(doc => {
//         if (doc) {
//             res.status(200).json({
//                 userTb: doc,
//                 request: {
//                     type: 'GET',
//                     url: 'http://localhost:3000/userTb/id'
//                 }
//             });
//         } else {
//             res.status(404)
//             .json({
//                 message: "No valid entry found for userId"
//             })
//         }
//     }).catch(err => {
//         console.log(err);
//     });
// });

// userId로 값 찾기
router.get('/id/:userId', (req, res, next) => {
    try {
        algo.paginationSearch(req, res, UserTb, 'userId', req.params.userId)
    } catch (err) {
        res.status(500).json({
            error : err
        })
    }
});

// 닉네임으로 값 찾기
// router.get('/nickname/:nickname', (req, res, next) => {
//     UserTb.find({nickname : req.params.nickname})
//     .exec()
//     .then(doc => {
//         if (doc) {
//             res.status(200).json({
//                 userTb: doc,
//                 request: {
//                     type: 'GET',
//                     url: 'http://localhost:3000/userTb/nickname'
//                 }
//             });
//         } else {
//             res.status(404)
//             .json({
//                 message: "No valid entry found for userId"
//             })
//         }
//     }).catch(err => {
//         console.log(err);
//     });
// });

// 닉네임으로 값 찾기
router.get('/nickname/:nickname', (req, res, next) => {
    try {
        algo.paginationSearch(req, res, UserTb, 'nickname', req.params.nickname)
    } catch (err) {
        res.status(500).json({
            error : err
        })
    }
});

// memo로 값 찾기
// router.get('/memo/:memo', (req, res, next) => {
//     UserTb.find({memo : req.params.memo})
//     .exec()
//     .then(doc => {
//         if (doc) {
//             res.status(200).json({
//                 userTb: doc,
//                 request: {
//                     type: 'GET',
//                     url: 'http://localhost:3000/userTb/memo'
//                 }
//             });
//         } else {
//             res.status(404)
//             .json({
//                 message: "No valid entry found for userId"
//             })
//         }
//     }).catch(err => {
//         console.log(err);
//     });
// });

// memo로 값 찾기
router.get('/memo/:memo', (req, res, next) => {
    try {
        algo.paginationSearch(req, res, UserTb, 'memo', req.params.memo)
    } catch (err) {
        res.status(500).json({
            error : err
        })
    }
});

// to find folder
router.get('/folder/:folderId', (req, res, next) => {
    UserTb.find({
        "folders._id": req.params.folderId
    },{
        "_id": 0,
        "folders": {
            "$elemMatch": {
            "_id": req.params.folderId
            }
        }
    })
    .populate('folders.stores.ytbStoreTbId')
    .populate('folders.stores.attractionTbId')
    .exec()
    .then(docs => {
        res.status(200).json({
            docs
        }); 
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

// to find store in forder
router.get('/store/:storeId', (req, res, next) => {
    UserTb.find({
        "folders.stores.storeId": req.params.storeId
    },{
        "_id": 0,
        "folders": {
            "$elemMatch": {
            "stores.storeId": req.params.storeId
            }
        }
    })
    .populate('folders.stores.ytbStoreTbId')
    .populate('folders.stores.attractionTbId')
    .exec()
    .then(docs => {
        res.status(200).json({
            docs
        }); 
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

// 유저 수정 - 관리자에서는 사용 안함
router.patch('/:userId', (req, res, next) => {
    const updateOps = {};
    for(const ops of req.body) {
        updateOps[ops.propName] = ops.value
    }
    UserTb.update({userId : req.params.userId}, { $set: updateOps })
    .exec()
    .then(result => {
        res.status(201).json({
            message: 'UserTb updated',
            request: {
                type: 'GET',
                url: 'http://localhost:3000/userTb' + userId
            }
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

// 유저 삭제 - 사용 안함
router.delete('/:userId', (req, res, next) => {
    UserTb.remove({userId : req.params.userId})
    // const id = req.params.productId;
    // UserTb.remove({_id: id})
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'UserTb deleted',
            request: {
                type: 'POST',
                url: 'http://localhost:3000/userTb/',
                // body: { name: 'String', price: 'Number' }
            }
        })
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

module.exports = router;