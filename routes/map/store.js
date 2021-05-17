const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const YtbStoreTb = require("../../models/ytbStoreTb.model")
const YtbChannelTb = require("../../models/ytbChannelTb.model")
const UserTb = require('../../models/userTb.model');

router.get('/map/store', async (req, res, next) => {

    req.body.userId = 'payment'

    let storeLike = false;
    if(req.body.userId) { // 로그인이 되어 있을 때 
        const user = await UserTb.findOne({
            "folders._id": req.query.folderId}
            , {
                "_id": 0,
                "folders": {
                    "$elemMatch": {
                        "_id": req.query.folderId
                    }
                }
            }
            )
        .exec();

        user.folders[0].stores.forEach(element => {
            console.log(element)
            if(element.storeId == req.query.storeId) {

                storeLike = true
            }
        })

    }
    YtbStoreTb.findOne({"_id": req.query.storeId})
    .exec()
    .then(docs => {
        res.status(200).json({

            _id: docs._id,
            storeName: docs.storeInfo.storeName,
            storeAddress:docs.storeInfo.storeAddress,
            location: docs.storeInfo.location,
            storeLike: storeLike

        });
        
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

router.get('/storeYoutuber/:store_id', (req, res, next) => {

    YtbChannelTb.find(
        {"video.storeId" : req.params.store_id}, {
            '_id':0,
            'video': {
                "$elemMatch": {
                'storeId':req.params.store_id
                }
            }
        })
    .select('_id')
    .select('ytbChannel')
    .select('ytbProfile')
    .select('ytbSubscribe')
    .exec()
    .then(docs => {
        res.status(200).json({
            video: docs.map(doc => {
                return {
        _id: doc._id,
        ytbChannel: doc.ytbChannel,
        ytbProfile: doc.ytbProfile,
        ytbSubscribe: doc.ytbSubscribe,
        ytbThumbnail: doc.video[0].ytbThumbnail,
        videoId: doc.video[0]._id
    }
})
        })
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });

});

router.get('/storeYoutuber/:store_id', (req, res, next) => {

    YtbChannelTb.find(
        {"video.storeId" : req.params.store_id}, {
            '_id':0,
            'video': {
                "$elemMatch": {
                'storeId':req.params.store_id
                }
            }
        })
    .select('_id')
    .select('ytbChannel')
    .select('ytbProfile')
    .select('ytbSubscribe')
    .exec()
    .then(docs => {
        res.status(200).json({
            video: docs.map(doc => {
                return {
        _id: doc._id,
        ytbChannel: doc.ytbChannel,
        ytbProfile: doc.ytbProfile,
        ytbSubscribe: doc.ytbSubscribe,
        ytbThumbnail: doc.video[0].ytbThumbnail,
        videoId: doc.video[0]._id
    }
})
        })
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });

});

router.get('/ytbVideo/:store_id', (req, res, next) => {

    YtbChannelTb.find(
        {"video.storeId" : req.params.store_id}, {
            '_id':0,
            'video': {
                "$elemMatch": {
                'storeId':req.params.store_id
                }
            }
        })
    .select('_id')
    .select('ytbChannel')
    .select('ytbProfile')
    .select('ytbSubscribe')
    .select('')
    .exec()
    .then(docs => {
        res.status(200).json({
            video: docs.map(doc => {
                return {
        _id: doc._id,
        ytbChannel: doc.ytbChannel,
        ytbProfile: doc.ytbProfile,
        ytbSubscribe: doc.ytbSubscribe,
        ytbThumbnail: doc.video[0].ytbThumbnail,
        videoId: doc.video[0]._id,
        ytbVideoName: doc.video[0].ytbVideoName,
        hits: doc.video[0].hits
    }
})
        })
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });

});
module.exports = router;