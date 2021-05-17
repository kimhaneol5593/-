const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const YtbStoreTb = require("../../models/ytbStoreTb.model");
const ShareFlowTb = require("../../models/shareFlowTb.model");
const AttractionTb = require("../../models/attractionTb.model");
const UserTb = require('../../models/userTb.model');
const imgUrl = `https://test-gurume.s3.ap-northeast-2.amazonaws.com/`;

router.get('/storeDetail/flow/:store_id', async (req, res, next) => {
    try {
        req.body.userId = 'payment'
        let flowLikeCheck =null;
        if(req.body.userId) { // 로그인이 되어 있을 때 
           flowLikeCheck = await UserTb.findOne({userId: req.body.userId})
           .select('likeFlows')
           .exec();
        }

        const docs = await UserTb.find({
                "folders.stores.storeId": req.params.store_id
            },{
                "_id": 0,
                "folders": {
                    "$elemMatch": {
                    "stores.storeId": req.params.store_id
                    }
                }
            })
            .exec()

            let ids = []
            docs.forEach(doc => {
                ids.push(doc.folders[0]._id);
    
            });

            await ShareFlowTb.find({
                'folderId': {$in:ids}
            })
            .exec()
            .then(docs => {
              res.status(200).json({
                shareFlowTb: docs.map(doc => {
                        let flowLike = false;
                        if(req.body.userId) { // 로그인이 되어 있을 때 
                            if(flowLikeCheck.likeFlows.includes(doc._id.toString())) {
                                flowLike = true;
                            }
    
                         }
    
                        
                   
                      return {
                          _id: doc._id,
                          shareTitle: doc.shareTitle,
                          shareThumbnail: imgUrl+ doc.shareThumbnail,
                          //shareThumbnail: doc.shareThumbnail,
                          adminTag: doc.adminTag,
                          userTags: doc.userTags,
                          folderId: doc.folderId,
                          flowLike: flowLike
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

router.get('/storeDetail/attraction', (req, res, next) => {
    const latTmp = 0.5;
    const lngTmp = 1;
    AttractionTb.find()
    .where('attractionInfo.location.lat').gte(req.query.lat*1-latTmp).lte(req.query.lat*1+latTmp)
    .where('attractionInfo.location.lng').gte(req.query.lng*1-lngTmp).lte(req.query.lng*1+lngTmp)
    .select()
    .populate('adminTagTbId')
    .exec()
    .then(docs => {
        res.status(200).json({
            count: docs.length,
            attractionTb: docs.map(doc => {
                return {
                    _id: doc._id,
                    attractionName:doc.attractionInfo.attractionName,
                    location: doc.attractionInfo.location
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

module.exports = router;