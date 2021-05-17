const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const YtbChannelTb = require("../../models/ytbChannelTb.model");
const YtbStoreTb = require("../../models/ytbStoreTb.model");
const AdminTagTb = require('../../models/adminTagTb.model');
const UserTb = require('../../models/userTb.model');
const ShareFlowTb = require("../../models/shareFlowTb.model");
const UserTagTb = require('../../models/userTagTb.model');
const YtbReqTb = require("../../models/ytbReqTb.model")
function getCurrentDate(){
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth();
    var today = date.getDate();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var milliseconds = date.getMilliseconds();
    return new Date(Date.UTC(year, month, today, hours, minutes, seconds, milliseconds));
}
// 유튜버 상세 페이지 - 유튜버 정보
router.get('/youtuber/:ytb_id', async (req, res, next) => {
    req.body.userId = 'payment'
    let youtuberLike = false;
    if(req.body.userId) { // 로그인이 되어 있을 때 
        const user = await UserTb.findOne({userId: req.body.userId})
        .select('likeYoutuber')
        .exec();

        if(user.likeYoutuber.includes(req.params.ytb_id)) {
            youtuberLike = true;
        }
        
    }

    // 인기 급상승 동영상 개수
    const youtuber = await YtbChannelTb.findOne({_id : req.params.ytb_id})
    .select('video')
    .exec();

    let video = 0;
    youtuber.video.forEach(element => {
        if(element.RankIncrease > 20)
            video++;
    })
    // 최근 올라온 동영상 개수
    let last = 0;
    youtuber.video.forEach(element => {
        let date = getCurrentDate()
        date = date.setDate(date.getDate() - 150);
        if(element.uploadDate <= getCurrentDate() && element.uploadDate >= date) {
            last++;
        }
    })
    YtbChannelTb.findOne({_id : req.params.ytb_id})
    .populate('video.ytbStoreTbId')
    .exec()
    .then(async docs => {
        let Increase = docs.ytbRankIncrease - docs.ytbRank

        res.status(200).json({
            ytbChannel : docs.ytbChannel,
            ytbProfile: docs.ytbProfile,
            ytbSubscribe: docs.ytbSubscribe,
            rank: docs.ytbRankIncrease,
            ytbRankIncrease: Increase,
            youtuberLike : youtuberLike,
            videoCount: video,
            lastVideoCount : last
        });
        
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

// 유튜버가 방문한 맛집 영상을 포함한 동선의 해시태그 순위
router.get('/youtuber/userTag/:ytb_id', async(req, res, next) => {
    // 유튜버가 방문한 맛집
    const youtuber = await YtbChannelTb.findOne({_id : req.params.ytb_id})
    .select('video.ytbStoreTbId')
    .exec()

    let search = []
    youtuber.video.forEach(element => {
        search.push(element.ytbStoreTbId)
    });

    const storeId = await YtbStoreTb.find({_id: {$in: search}})
    .select('_id')
    .exec()

    // storeIds
    let ids = []
    storeId.forEach(id => {
        ids.push(id._id);
    })

    // 맛집이 포함된 동선
    const flow = await UserTb.find({
        "folders.stores.storeId": {$in: ids}
    },{
        "_id": 0,
        "folders": {
            "$elemMatch": {
            "stores.storeId": {$in: ids}
            }
        }
    })
    .exec()
    let flowIds = []
    flow.forEach(doc => {
        flowIds.push(doc.folders[0]._id);

    });

    const shareFlow = await ShareFlowTb.find({
        'folderId': {$in:flowIds}
    })
    .exec()
    let userTags = []
    // 동선에 포함된 해시태그
    shareFlow.forEach(shareFlow => {
        shareFlow.userTags.forEach(tag => {
            userTags.push(tag);
        })
    })

    // 해시태그 순위
    const userTag = await UserTagTb.findOne({_id:'5fb7a29bf648764c3cb9ebeb'})
    .exec();
    let result = []
    userTag.userTag.forEach(element => {
        if(userTags.includes(element.userTag)) {
            result.push(element);
        }
    })
    result = result.sort(function(a, b) {
        return b.useCount - a.useCount
    })
    
    result = result.map(doc => doc.userTag);
    res.status(200).json(result);
    

})

// 유튜브 영상 정보 가져오기 - 조회수 순으로 
router.get('/youtuber/video/:ytb_id', (req, res, next) => {
    YtbChannelTb.findOne({_id : req.params.ytb_id})
    .select('video.hits')
    .select('video.ytbAddress')
    .select('video.ytbVideoName')
    .select('video.ytbThumbnail')
    .exec()
    .then(docs => {

        const video = docs.video.sort((a, b) =>{
            return b.hits - a.hits;
        }).splice(0, 5)

        res.status(200).json({
            video: video
        });
        
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

// 유튜버가 지역별로 방문한 지역
router.get('/youtuber/region/:ytb_id', async (req, res, next) => {
    try {
        const youtuber = await YtbChannelTb.findOne({_id : req.params.ytb_id})
        .select('video.ytbStoreTbId')
        .exec()

        let search = []
        youtuber.video.forEach(element => {
            search.push(element.ytbStoreTbId)
        });

        await YtbStoreTb.find({_id: {$in: search}})
        .select('regionTag')
        .distinct('regionTag')
        .exec()
        .then(regionTag => {
            res.status(200).json(regionTag)

        })

    } catch(e) {
        res.status(500).json({
            error: e
        });

    }
});

// 유튜버가 지역별로 방문한 맛집 영상
router.post('/youtuber/localVideo', async (req, res, next) => {
    try {
        const youtuber = await YtbChannelTb.findOne({_id : req.body.ytb_id})
        .select('video.storeId')
        .select('video._id')
        .select('video.ytbVideoName')
        .select('video.ytbAddress')
        .select('video.hits')
        .exec()

        let search = []
        youtuber.video.forEach(element => {
            search.push(element.storeId)
        });

        let store = await YtbStoreTb.find({_id: {$in: search}})
        .where('regionTag')
        .in(req.body.regionTags)
        .select('_id')
        .select('regionTag')
        .select('storeInfo')
        .exec()

        console.log(store)

        let result = []

        store.forEach(element =>  {
            youtuber.video.forEach(id => {
                if(element._id == id.storeId) {
                    result.push({
                        _id: id._id,
                        ytbVideoName: id.ytbVideoName,
                        ytbAddress: id.ytbAddress,
                        storeId: id.storeId,
                        hits: id.hits,
                        storeName: element.storeInfo.storeName,
                        storeAddress :element.storeInfo.storeAddress,
                        regionTag:element.regionTag
                    })
                }
            })
        })
        return res.status(200).json(result)

    } catch(e) {
        res.status(500).json({
            error: e
        });

    }
});

// 유튜버 좋아요
router.post('/youtuber/like', async (req, res, next) => {
    try {
        mongoose.set('useFindAndModify', false);
        req.body.userId = 'payment'
        let youtuberLike = false;
        if(req.body.userId) { // 로그인이 되어 있을 때 
            const user = await UserTb.findOne({userId: req.body.userId})
            .select('likeYoutuber')
            .exec();
            console.log(user)
            if(user.likeYoutuber.includes(req.body.ytb_id)) {
                youtuberLike = true;
            }
            
        }
        console.log(youtuberLike)
        // 추가할 사람 검색
        const user = await UserTb
        .findOne({
            "userId": req.body.userId
        })
        .exec()
        if(youtuberLike) {// 유튜버 삭제하기
            let i = 0
            tmp = 0
            user.likeYoutuber.forEach(element => {
                if(element == req.body.ytb_id) {
                    i = tmp;
                }
                tmp++;
            });

            user.likeYoutuber.splice(i,1)
 
        } else { // 유튜버 추가하기
            user.likeYoutuber.push(req.body.ytb_id);
        }
        // 좋아요 업데이트
        await UserTb
        .findOneAndUpdate({
            "userId": req.body.userId
        }, user)
        .exec()
        .then(doc => {
            res.status(201).json("좋아요 상태를 변경했습니다.")
        })


    }catch(e) {
        res.status(500).json({
            error: e
        });

    }
});

// 유튜버 신청
router.post('/youtuberRequest', async (req, res, next) => {
    try {
        req.body.user_id = 'payment'
        const user = await UserTb
            .findOne({
                "userId": req.body.user_id
            })
            .select('_id')
            .select('userId')
            .exec()
        mongoose.set('useFindAndModify', false);

        // 크롤링 함수 불러오기
        
        //const result = []// 함수 실행 return 값 반환
        // const result = {
        //     ytbProfile: 'test',
        //     ytbChannel: req.body.ytbChannel,
        //     ytbSubscribe: 1060000,
        //     videoCount: 1130,
        //     ytbHits: 355899261,
        //     ytbLinkAddress: "test"
        // }
        // // 신청할 객체에 필요한 정보 추가하기
        // result.userTbId = user._id;
        // result.userId = req.body.user_id;

        // console.log(result)
        // // 신청 db에 추가
        // await YtbReqTb(result).save()

    }catch(e) {
        res.status(500).json({
            error: e
        });

    }
});


// 유튜버 좋아요 리스트 
router.get('/likeYoutuber', async (req, res, next) => {
    try {

        req.body.user_id = 'payment';
        const user = await UserTb.findOne({"userId": req.body.user_id})
        .select('likeYoutuber')
        .exec()
        console.log(user)
    
        let ids = user.likeYoutuber.map(doc => doc);

        console.log(ids)
        await YtbChannelTb.find({'_id': {$in:ids}})
          .populate({
              path: 'video.ytbStoreTbId'
          })
          .exec()
          .then(docs => {
            res.status(200).json({
                count: docs.length,
                ytbChannelTb: docs.map(doc => {
                    return {
                        _id: doc._id,
                        ytbChannel: doc.ytbChannel,
                        ytbProfile: doc.ytbProfile,
                        ytbSubscribe: doc.ytbSubscribe,
                        storeCount: doc.video.length
                    }
                })
            })
        }) 
    } catch(e) {
        res.status(500).json({
            error: e
        });
    }
})


module.exports = router;
