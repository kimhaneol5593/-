const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const YtbReqTb = require("../../models/ytbReqTb.model")
const UserTb = require("../../models/userTb.model")
const YtbChannelTb = require("../../models/ytbChannelTb.model")
const YtbCrawlingTb = require("../../models/ytbCrawlingTb.model")

router.get('/', (req, res, next) => {
    YtbReqTb.find()
    .select()
    .populate('userTbId')
    .exec()
    .then(docs => {
        res.status(200).json({
            count: docs.length,
            ytbReqTb: docs.map(doc => {
                return {
                    _id: doc._id,
                    ytbChannel: doc.ytbChannel,
                    ytbProfile: doc.ytbProfile,
                    ytbLinkAddress: doc.ytbLinkAddress,
                    ytbSubscribe: doc.ytbSubscribe,
                    ytbHits: doc.ytbHits,
                    videoCount: doc.videoCount,
                    userTbId: doc.userTbId,
                    userId: doc.userId,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/ytbReqTb/' + doc.ytbChannel
                    }
                }
            })
        });
        
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

// router.get('/:userId', (req, res, next) => {
//     YtbReqTb.find({ 'userTbId.userId' : req.params.userId })
//     .populate({
//         path: '  userTbId',
//         match: {
//             userId: req.params.userId
//         },
//         select: 'nickname -_id -userId'
//     })
//     .exec()
//     .then(doc => {
//         res.status(200).json(doc)
//     }).catch(err => {
//         res.status(500).json({
//             error: err
//         });
//     });
// });

// populated 안의 값 쿼리
// router.get('/:userId', (req, res, next) => {
//     UserTb.find({
//       "userId": req.params.userId
//     }).exec()
//     .then(docs => {
//         let ids = docs.map(doc => doc.id);
//         YtbReqTb.find({
//             "userTbId": {$in:ids}
//         })
//         .populate({
//             path: 'userTbId'
//         })
//         .exec()
//         .then(docs => {
//             res.status(200).json({
//                 docs
//             }); 
//         })
//         .catch(err => {
//             res.status(500).json({
//                 error: err
//             });
//         });
//     })
//     .catch(err => {
//         res.status(500).json({
//             error: err
//         });
//     });
// });

// populated 안 값 쿼리 - 간단 버전
// router.get('/:userId', async (req, res, next) => {
//     try {
//         const docs = await UserTb.find({
//             "userId": req.params.userId
//           }).exec()

//         let ids = docs.map(doc => doc.id);

//         const data = await YtbReqTb.find({
//               "userTbId": {$in:ids}
//           })
//           .populate({
//               path: 'userTbId'
//           })
//           .exec()

//         return res.status(200).json({
//             data
//         }); 


//     } catch(e) {
//         res.status(500).json({
//             error: e
//         });
//     }
// });

// populated 내 쿼리 map 안 쓴 버전 - userId
router.get('/:userId', async (req, res, next) => {
    try {
        const docs = await UserTb.find({
            "userId": req.params.userId
          }).exec()

        // let ids = docs.map(doc => doc.id);
        let ids = ''
        docs.forEach(doc => {
            ids = doc.id;
        });

        const data = await YtbReqTb.find({
              "userTbId": {$in:ids}
          })
          .populate({
              path: 'userTbId'
          })
          .exec()

        return res.status(200).json({
            data
        }); 

    } catch(e) {
        res.status(500).json({
            error: e
        });
    }
});

// ytbReqTb 데이터 저장
router.post('/', (req, res, next) => {
    const ytbReqTb = new YtbReqTb({
        _id: new mongoose.Types.ObjectId(),
        ytbChannel: req.body.ytbChannel,
        ytbProfile: req.body.ytbProfile,
        ytbLinkAddress: req.body.ytbLinkAddress,
        ytbSubscribe: req.body.ytbSubscribe,
        ytbHits: req.body.ytbHits,
        videoCount: req.body.videoCount,
        userTbId: req.body.userTbId,
        userId: req.body.userId,
    });
    ytbReqTb.save()
    .then(result => {
        console.log(result);
        res.status(201).json({
            message: 'Created ytbReqTb successfully',
            createdUserId: {
                _id: result._id,
                ytbChannel: result.ytbChannel,
                ytbProfile: result.ytbProfile,
                ytbLinkAddress: result.ytbLinkAddress,
                ytbSubscribe: result.ytbSubscribe,
                ytbHits: result.ytbHits,
                videoCount: result.videoCount,
                userTbId: result.userTbId,
                userId: result.userId,
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/ytbReqTb/' + result.userId
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

// 신청 유튜버 승인 시
// router.put('/recognize/:youtuber', async (req, res, next) => {
//     // ytbReqTb에서 승인 시 데이터 변수에 저장
//     const ytbReq = await YtbReqTb.find({ 'ytbChannel' : req.params.youtuber });
//     console.log(ytbReq[0]);
    
//     // 변수에 담은 뒤 신청 유튜버에서 삭제
//     await YtbReqTb.remove({ 'ytbChannel' : req.params.youtuber });

//     // ytbChannelTb에 입력
//     const ytbChannelTb = new YtbChannelTb({
//         _id: new mongoose.Types.ObjectId(),
//         ytbChannel: ytbReq[0].ytbChannel,
//         ytbProfile: ytbReq[0].ytbProfile,
//         ytbLinkAddress: ytbReq[0].ytbLinkAddress,
//         ytbSubscribe: ytbReq[0].ytbSubscribe,
//         ytbSubIncrease: 0,
//         ytbHits: ytbReq[0].ytbHits,
//         ytbRank: ytbReq[0].ytbRank,
//         ytbRankIncrease: ytbReq[0].ytbRankIncrease,
//         likeCount: ytbReq[0].likeCount,
//         video: []
//     });
//     ytbChannelTb.save()
//     .then(result => {
//         // console.log(result);
//         res.status(201).json({
//             message: 'ytbReqTb -> ytbChannelTb stored',
//             createdYtbReqTbTb: {
//                 _id: result._id,
//                 ytbChannel: result.ytbChannel,
//                 ytbProfile: result.ytbProfile,
//                 ytbLinkAddress: result.ytbLinkAddress,
//                 ytbSubscribe: result.ytbSubscribe,
//                 ytbSubIncrease: 0,
//                 ytbHits: result.ytbHits,
//                 ytbRank: result.ytbRank,
//                 ytbRankIncrease: result.ytbRankIncrease,
//                 likeCount: result.likeCount,
//                 video: result.video
//             },
//             request: {
//                 type: 'PUT',
//                 url: 'http://localhost:3000/ytbChannelTb/' + result._id
//             }
//         });
//     })
//     .catch(err => {
//         console.log(err);
//         res.status(500).json({
//             error: err
//         });
//     });

//     // ytbCrawling으로 이동
//     const ytbCrawlingTb = new YtbCrawlingTb({
//         _id: new mongoose.Types.ObjectId(),
//         ytbChannel: ytbReq[0].ytbChannel,
//         ytbProfile: ytbReq[0].ytbProfile,
//         videoCount: ytbReq[0].videoCount,
//         video: []
//     });
//     ytbCrawlingTb.save()
//     .then(result => {
//         // console.log(result);
//         res.status(201).json({
//             message: 'ytbReqTb -> ytbCrawlingTb stored',
//             createdYtbReqTbTb: {
//                 _id: result._id,
//                 ytbChannel: result.ytbChannel,
//                 ytbProfile: result.ytbProfile,
//                 videoCount: result.videoCount,
//                 video: result.video
//             },
//             request: {
//                 type: 'PUT',
//                 url: 'http://localhost:3000/ytbCrawlingTb/' + result._id
//             }
//         });
//     })
//     .catch(err => {
//         console.log(err);
//         res.status(500).json({
//             error: err
//         });
//     });
// });

// 신청 유튜버 승인 시 2
router.put('/recognize/:youtuber', async (req, res, next) => {
    // ytbReqTb에서 승인 시 데이터 변수에 저장
    const ytbReq = await YtbReqTb.findOne({ 'ytbChannel' : req.params.youtuber });
    
    // 변수에 담은 뒤 신청 유튜버에서 삭제
    await YtbReqTb.remove({ 'ytbChannel' : req.params.youtuber });

    // ytbChannelTb에 입력
    const ytbChannelTb = new YtbChannelTb({
        _id: new mongoose.Types.ObjectId(),
        ytbChannel: ytbReq.ytbChannel,
        ytbProfile: ytbReq.ytbProfile,
        ytbLinkAddress: ytbReq.ytbLinkAddress,
        ytbSubscribe: ytbReq.ytbSubscribe,
        ytbSubIncrease: 0,
        ytbHits: ytbReq.ytbHits,
        ytbRank: ytbReq.ytbRank,
        ytbRankIncrease: ytbReq.ytbRankIncrease,
        likeCount: ytbReq.likeCount,
        video: []
    });
    ytbChannelTb.save()

    // ytbCrawling으로 이동
    const ytbCrawlingTb = new YtbCrawlingTb({
        _id: new mongoose.Types.ObjectId(),
        ytbChannel: ytbReq.ytbChannel,
        ytbProfile: ytbReq.ytbProfile,
        videoCount: ytbReq.videoCount,
        video: []
    });
    ytbCrawlingTb.save()
    .then(result => {
        res.status(201).json({
            // message1: 'ytbReqTb -> ytbChannelTb stored',
            // message2: 'ytbReqTb -> ytbCrawlingTb stored',
            // status: 'Success',
            ytbChannel: ytbReq.ytbChannel,
            videoCount: ytbReq.videoCount
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

module.exports = router;