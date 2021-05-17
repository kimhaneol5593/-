const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const AdminTagTb = require('../../models/adminTagTb.model');
const ShareFlowTb = require("../../models/shareFlowTb.model");
const UserTagTb = require('../../models/userTagTb.model');
const UserTb = require('../../models/userTb.model');
const imgUrl = `https://test-gurume.s3.ap-northeast-2.amazonaws.com/`;

router.get('/flowSearch', (req, res, next) => {
    AdminTagTb.find()
      .exec()
      .then(docs => {
          const response = {
              count: docs.length,
              adminTagTb: docs.map(doc => {
                  return {
                      _id: doc._id,
                      //adminTag: doc.adminTag,
                      seasonTag: doc.adminTag.seasonTag,
                      regionTag: doc.adminTag.regionTag
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

// shareFlowTb에서 아이디로 검색
router.get('/flowSearch/shareFlow', (req, res, next) => {
    req.params.user_id = "payment"
    ShareFlowTb.find({userId : req.params.user_id})
    .exec()
    .then(docs => {
        res.status(200).json({
            shareFlowCount: docs.length
            //docs
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
});


// 동선 검색 - 해시태그 검색
router.get('/flowSearch/tag/:user_tag', (req, res, next) => {
    UserTagTb.findOne(
        {'userTag.userTag': {$regex:req.params.user_tag}})
    .exec()
    .then(docs => {
        let tag = []
        docs.userTag.forEach(element => {
            if(element.userTag.includes(req.params.user_tag)){
                let index = element.userTag.indexOf(req.params.user_tag)
                tag.push(element.userTag);
            }
        });
        res.status(200).json(tag);
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

// 동선 검색
router.post('/flowSearch/flow/', async (req, res, next) => {
    // 동선 좋아요 확인
    req.body.userId = 'payment'
    // let flowLike = false;
    let flowLikeCheck =null;
     if(req.body.userId) { // 로그인이 되어 있을 때 
        flowLikeCheck = await UserTb.findOne({userId: req.body.userId})
        .select('likeFlows')
        .exec();
     }

    if(req.body.option == "tag") {
        // 해시태그로 검색
        if(req.body.userTag.length == 0) {
            await ShareFlowTb.find()
            .where('adminTag.regionTag').in(req.body.regionTag)
            .where('adminTag.seasonTag').in(req.body.seasonTag)
            .exec()
            .then(docs => {
                console.log(docs)
                res.status(200).json({
                    count: docs.length,
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
                        shareThumbnail: imgUrl + doc.shareThumbnail,
                        //shareThumbnail: doc.shareThumbnail,
                        adminTag: doc.adminTag,
                        userTags: doc.userTags,
                        folderId: doc.folderId,
                        flowLike: flowLike
                    }})
                })
            })
            .catch(err => {
                res.status(500).json({
                    error: err
                });
            });

        } else {

            await ShareFlowTb.find()
            .where('adminTag.regionTag').in(req.body.regionTag)
            .where('adminTag.seasonTag').in(req.body.seasonTag)
            .where('userTags').in(req.body.userTag)
            .exec()
            .then(docs => {
                console.log(docs)
                res.status(200).json({
                    count: docs.length,
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
                    }})
                })
            })
            .catch(err => {
                res.status(500).json({
                    error: err
                });
            });
        }

    } else if(req.body.option == "title") {
        // 타이틀로 검색
        await ShareFlowTb.find({'shareTitle': {$regex:req.body.shareTitle}})
        .exec()
        .then(docs => {
            console.log(docs)
            res.status(200).json({
                count: docs.length,
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
                    shareThumbnail: imgUrl + doc.shareThumbnail,
                    //shareThumbnail: doc.shareThumbnail,
                    adminTag: doc.adminTag,
                    userTags: doc.userTags,
                    folderId: doc.folderId,
                    flowLike: flowLike
                }})
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
    } else if(req.body.option == "nickname") {
        // Nickname으로 검색
        const user = await UserTb.find({'nickname': {$regex:req.body.nickname}})
        .select('userId')
        .exec();
        let ids = user.map(doc => doc.userId)

        console.log(user);
        await ShareFlowTb.find({'userId': {$in: ids}})
        .exec()
        .then(docs => {
            res.status(200).json({
                count: docs.length,
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
                    userTags: doc.userTags,
                    folderId: doc.folderId,
                    flowLike: flowLike
                }})
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
    }






});

module.exports = router;