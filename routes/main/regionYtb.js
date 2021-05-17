const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const YtbChannelTb = require("../../models/ytbChannelTb.model");
const YtbStoreTb = require("../../models/ytbStoreTb.model");

router.get('/regionYtb', (req, res, next) => {
    YtbChannelTb.find()
    .select()
    .populate('video.ytbStoreTbId')
    .exec()
    .then(docs => {
        res.status(200).json({
            count: docs.length,
            ytbChannelTb: docs.map(doc => {
                return {
                    _id: doc._id,
                    ytbChannel: doc.ytbChannel,
                    ytbProfile: doc.ytbProfile,
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

// ytbChannel 지역으로 검색
router.get('/regionYtb/region/:regionTag', async (req, res, next) => {
    try {
        const docs = await YtbStoreTb.find({
            "regionTag": req.params.regionTag
          }).exec()

        // let ids = docs.map(doc => doc.id);
        let ids = []
        docs.forEach(doc => {
            ids.push(doc.id);

        });

        await YtbChannelTb.find({
              'video.ytbStoreTbId': {$in:ids}
          })
          .populate({
              path: 'video.ytbStoreTbId'
          })
          .sort({'ytbSubscribe': -1, 'ytbHits': -1})
          .exec()
          .then(docs => {
            res.status(200).json({
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
});

module.exports = router;