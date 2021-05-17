const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const YtbCrawlingTb = require('../../models/ytbCrawlingTb.model');
const algo = require("./algo")

// 데이터 수집 페이지 메인
router.get('/socket', async (req, res, next) => {
    try {
        var normalCount = 0;
        var errCount = 0;
        var completeCount = 0;

        // 크롤링 대기 데이터 목록
        var normalCrawling = await YtbCrawlingTb.find()

        var errCrawling = await YtbCrawlingTb.aggregate([
            {
              "$set": {
                "video": {
                  "$filter": {
                    "input": "$video",
                    "as": "v",
                    "cond": {"$eq": ["$$v.status","에러"]}
                  }
                }
              }
            }
        ])

        // status가 완료인 유튜버들 및 영상들
        var completeCrawling = await YtbCrawlingTb.aggregate([
            {
              "$set": {
                "video": {
                  "$filter": {
                    "input": "$video",
                    "as": "v",
                    "cond": {"$eq": ["$$v.status","완료"]}
                  }
                }
              }
            }
        ])

        // status가 ''인 video 갯수 세기
        for (var i = 0; i < normalCrawling.length; i++)
            normalCount += normalCrawling[i].video.length

        // status가 에러인 video 갯수 세기
        for (var i = 0; i < errCrawling.length; i++)
            errCount += errCrawling[i].video.length
        
        // status가 완료인 video 갯수 세기
        for (var i = 0; i < completeCrawling.length; i++)
            completeCount += completeCrawling[i].video.length

        res.status(200).json([
            {
                status : 'normalCrawling',
                data : normalCrawling
            },
            {
                status : 'errCrawling',
                data : errCrawling,
            },
            {
                status : 'completeCrawling',
                data : completeCrawling
            }
            // status : 'errCrawling',
            // data : errCrawling,
            // status : 'completeCrawling',
            // data : completeCrawling
            // normalTotal: normalCount,
            // errTotal: errCount,
            // completeTotal: completeCount,
            // { normalCrawling },
            // { errCrawling },
            // { completeCrawling }
        ])
    } catch (err) {
        res.status(500).json({
            error : err
        })
    }
});

// 에러 해결 메인 페이지 - 좌측
router.get('/error', async (req, res, next) => {
    try {
        var errCount = 0;

        // 에러가 발생한 자료들
        var errCrawling = await YtbCrawlingTb.aggregate([
            {
              "$set": {
                "video": {
                  "$filter": {
                    "input": "$video",
                    "as": "v",
                    "cond": {"$eq": ["$$v.status","에러"]}
                  }
                }
              }
            }
        ])

        // status가 에러인 video 갯수 세기
        for (var i = 0; i < errCrawling.length; i++)
            errCount += errCrawling[i].video.length

        res.status(200).json({
            errTotal: errCount,
            errCrawling
        })
    } catch (err) {
        res.status(500).json({
            error : err
        })
    }
});

// 에러 해결 메인 페이지 - 우측
router.get('/error/:channelId', async (req, res, next) => {
    try {
        var more = await YtbCrawlingTb.findOne({
            "ytbChannel": req.params.channelId
        },{
            "_id": 0,
            "video": {
                "$elemMatch": {
                    "status": '에러'
                }
            }
        })

        res.status(200).json(more)
    } catch (err) {
        res.status(500).json({
            error : err
        })
    }
});

// 삭제 버튼 클릭 시 배열 안 해당 영상 삭제
router.delete('/video/delete/:channelId/:videoId', (req, res, next) => {
    YtbCrawlingTb.update({ 'ytbChannel': req.params.channelId }, 
    { $pull: { 'video' : { '_id' : req.params.videoId } } })
    .exec()
    .then(result => {
        res.status(200).json({
            result
        })
    }).catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

// < 주소 전달 > 프론트 -> 백 -> 크롤링 서버
router.put('/address/search/:addressId', async (req, res, next) => {
    try {
        console.log(req.params.addressId)

        res.status(200).json({
            data : req.params.addressId
        })
    } catch (err) {
        res.status(500).json({
            error : err
        })
    }
});

// < 주소 전달 > 크롤링 서버 -> 백 -> 프론트
router.put('/address/search/result/:addressId', async (req, res, next) => {
    try {
        // let crawlingFlatform = req.query.crawlingFlatform;
        // let crawlingLocation = {
        //     "lat" : req.query.lat,
        //     "lgt" : req.query.lgt
        // };
        // let crawlingStore = req.query.crawlingStore;

        res.status(200).json(req.body)
    } catch (err) {
        res.status(500).json({
            error : err
        })
    }
});

// router.post('/save/video/:channelId', (req, res, next) => {
//     const updateOps = {};
//     for(const ops of req.body) {
//         updateOps[ops.propName] = ops.value
//     }
//     YtbCrawlingTb.update({ 'ytbChannel': req.params.channelId }, { $set: updateOps })
//     .exec()
//     .then(result => {
//         res.status(201).json(result);
//     }).catch(err => {
//         res.status(500).json({
//             error: err
//         });
//     });
// });

// 3사 주소, 위도&경도, 가게 이름 저장 - 수정 중
// router.post('/save/video/:channelId', (req, res, next) => {
//     console.log(req.params)
//     console.log(req.body)

//     YtbCrawlingTb.update({ 'ytbChannel': req.params.channelId }, 
//     { $set: req.body })
//     .exec()
//     .then(result => {
//         res.status(200).json({
//             result
//         })
//     }).catch(err => {
//         res.status(500).json({
//             error: err
//         });
//     });
// });

// router.post('/save/video/:channelId', (req, res, next) => {
//     YtbCrawlingTb.updateOne({ 'ytbChannel': req.params.channelId }, 
//     { $set: req.body })
//     .exec()
//     .then(result => {
//         res.status(200).json({
//             result
//         })
//     }).catch(err => {
//         res.status(500).json({
//             error: err
//         });
//     });
// });

router.post('/save/video/:channelId', (req, res, next) => {
    YtbCrawlingTb.update({ 'ytbChannel': req.params.channelId },
    { $pull: { 'video': { '_id' : req.body.video[0]._id } } }
    )
    .exec()
    .then().catch(err => {
        res.status(500).json({
            error: err
        });
    });

    YtbCrawlingTb.update({ 'ytbChannel': req.params.channelId },
    { $push : req.body }
    )
    .exec()
    .then(result => {
        res.status(200).json('success to save')
    }).catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

// router.post("/save/video/:channelId", async (req, res, next) => {
//     try {
//         let result = await YtbCrawlingTb.find({ ytbChannel: req.params.channelId });
//         req.body.video.forEach((body) => {
//             for (var i = 0; i < result[0].video.length; i++) {            
//                 if (result[0].video[i]._id == body._id) {
//                     console.log("result : " + result[0].video[i]._id)
//                     console.log("body : " + body._id)
//                     console.log(body.storeInfo.location.lng)

//                     result[0].video[i].status = body.status;
//                     // result[0].video[i].storeInfo.storeName = body.storeInfo.storeName;
//                     // result[0].video[i].storeInfo.storeAddress = body.storeInfo.storeAddress;
//                     // result[0].video[i].storeInfo.location.lat = body.storeInfo.location.lat;
//                     // result[0].video[i].storeInfo.location.lng = body.storeInfo.location.lng;
//                     // break;
//                 }
//             }
//       });
//       await result.save();
  
//       res.status(200).json({
//         result
//       });
//     } catch (err) {
//       res.status(500).json({
//         err
//       });
//     }
// });

// 크롤링 데이터 생성용
router.post('/', (req, res, next) => {
    const ytbCrawlingTb = new YtbCrawlingTb({
      _id: new mongoose.Types.ObjectId(),
      ytbChannel: req.body.ytbChannel,
      ytbProfile: req.body.ytbProfile,
      videoCount: req.body.videoCount,
      video: req.body.video,
    });
    ytbCrawlingTb.save()
    .then(result => {
        res.status(201).json({
            message: 'Created ytbCrawlingTb successfully',
            createdYtbCrawlingTbId: {
                _id: result._id,
                ytbChannel: result.ytbChannel,
                ytbProfile: result.ytbProfile,
                video: result.video,
                videoCount: result.videoCount,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/attractionCrawlingTb/' + result._id
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

// router.get('/:userId', (req, res, next) => {
//     AttractionCrawlingTb.findOne({userId : req.params.userId})
//     // .select('name price _id')
//     .exec()
//     .then(doc => {
//         console.log("From database", doc);
//         if (doc) {
//             res.status(200).json({
//                 userTb: doc,
//                 request: {
//                     type: 'GET',
//                     url: 'http://localhost:3000/attractionCrawlingTb'
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

// router.patch('/:userId', (req, res, next) => {
//     const updateOps = {};
//     for(const ops of req.body) {
//         updateOps[ops.propName] = ops.value
//     }
//     AttractionCrawlingTb.update({userId : req.params.userId}, { $set: updateOps })
//     .exec()
//     .then(result => {
//         res.status(201).json({
//             message: 'AttractionCrawlingTb updated',
//             request: {
//                 type: 'GET',
//                 url: 'http://localhost:3000/attractionCrawlingTb' + userId
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
//     AttractionCrawlingTb.remove({userId : req.params.userId})
//     // const id = req.params.productId;
//     // UserTb.remove({_id: id})
//     .exec()
//     .then(result => {
//         res.status(200).json({
//             message: 'AttractionCrawlingTb deleted',
//             request: {
//                 type: 'POST',
//                 url: 'http://localhost:3000/attractionCrawlingTb/',
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