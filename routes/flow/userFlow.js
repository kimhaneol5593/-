require('dotenv').config;
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
//const userCheck = require('../index');
const UserTb = require('../../models/userTb.model');
const ShareFlowTb = require("../../models/shareFlowTb.model");
const { response } = require('express');

const imgUrl = `https://test-gurume.s3.ap-northeast-2.amazonaws.com/`;
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


  router.get('/userFlow/', async (req, res, next) => {
    try {
        req.params.user_id='payment'
        // 공유 동선
        const shareFlow = await ShareFlowTb.find({userId : req.params.user_id})
        .select('folderId')
        .select('shareTitle')
        .exec()

        let ids = []

        shareFlow.forEach(element => {
            ids.push(element.folderId);
        })

        // 공유 되지 않은 동선
        let userFlow = await UserTb.findOne
        (
            {userId : req.params.user_id}
        )
        //.find({'folders._id': {$nin: ids}})
        .select('folders._id')
        .select('folders.folderTitle')
        .exec()
        
        let flow = []
        userFlow.folders.forEach(folder => {
            share = false
            ids.forEach(id => {
                if(folder._id == id.toString()){
                    share = true;
                }
            }) 
            flow.push({_id: folder._id,
                        folderTitle: folder.folderTitle,
                        share : share})
          })
          
       return res.status(200).json(flow)
        
    } catch(e) {
        res.status(500).json({
            error: e
        });
    }
});

// 검색한 폴더의 각 맛집, 위치
router.get('/userFlow/folder/:folderId', (req, res, next) => {
    UserTb.findOne({
        "folders._id": req.params.folderId
    },{
        "_id": 0,
        "folders": {
            "$elemMatch": {
            "_id": req.params.folderId
            }
        }
    })
    .select('stores')
    .populate({path :'folders.stores.ytbStoreTbId',
                select: 'storeInfo.location storeInfo.storeName storeInfo.storeAddress'})
    .populate({path : 'folders.stores.attractionTbId',
                select: 'attractionInfo.location attractionInfo.attractionName attractionInfo.attractionAddress'})
    .exec()
    .then(docs => {
        let stores = [];
        docs.folders[0].stores.forEach(element => {
            if(!element.ytbStoreTbId) { // 관광지, 카페
                stores.push({
                    storeName: element.attractionTbId.attractionInfo.attractionName,
                    storeAddress: element.attractionTbId.attractionInfo.attractionAddress,
                    location: element.attractionTbId.attractionInfo.location,
                    storeId: element.storeId,
                    typeStore: element.typeStore

                })
            }else {// 맛집
                stores.push({
                    storeName: element.ytbStoreTbId.storeInfo.storeName,
                    storeAddress: element.ytbStoreTbId.storeInfo.storeAddress,
                    location: element.ytbStoreTbId.storeInfo.location,
                    storeId: element.storeId,
                    typeStore: element.typeStore
                })
            }
        })

        res.status(200).json(stores); 
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

// 선택한 폴더 내의 stores 순서 바꿀 때
router.put('/userFlow/folder', async (req, res, next) => {
    try {
        req.body.userId = "payment"
        // user 정보 검색
        const user = await UserTb
            .findOne({
                "userId": req.body.userId
            })
            .exec()
            let index = 0
            let tmp = 0
            user.folders.forEach(element => {
                if(element._id == req.body.folderId) {
                    index = tmp;
                }
                tmp++;
            });
            console.log(user.folders[0].stores)

        //바뀐 store 순서대로 정렬
        let changeStores = [] 
        user.folders[index].stores.forEach(element => {
            changeStores[req.body.storeIds.indexOf(element.storeId)] = element;

        })
        user.folders[index].stores = changeStores;

        mongoose.set('useFindAndModify', false);
        // 바뀐 store 배열로 update 해주기
        await UserTb
        .findOneAndUpdate({
            "userId": req.body.userId
        }, user)
        .exec()
        .then(doc => {
            res.status(201).json("stores의 순서를 변경했습니다.")
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
    } catch(e) {
        res.status(500).json({
            error: e
        });
    } 

});


// 유저 폴더 만들기
router.post('/userFlow', async (req, res, next) => {
    try {
        req.body.user_id = 'payment'
        const user = await UserTb
            .findOne({
                "userId": req.body.user_id
            })
            .exec()

        user.folders.push({
            folderTitle: req.body.folderTitle,
            createDate: getCurrentDate(new Date()),  
            updateDate: null,
            stores: []               
        })
        console.log(user)
        mongoose.set('useFindAndModify', false);
        await UserTb
        .findOneAndUpdate({
            "userId": req.body.user_id
        }, user)
        .exec()
        .then(doc => {
            res.status(201).json("폴더가 생성되었습니다.")
        })


    }catch(e) {
        res.status(500).json({
            error: e
        });

    }
});

// 유저 폴더 수정
router.put('/userFlow', async (req, res, next) => {
    try {
        req.body.user_id = 'payment'
        const user = await UserTb
            .findOne({
                "userId": req.body.user_id
            })
            .exec()

            let index = 0
            let tmp = 0
            let ids = []
            user.folders.forEach(element => {
                ids.push(element._id.toString())
                if(element._id == req.body.folder_id) {
                    index = tmp;
                }
                tmp++;
            });

            user.folders[index].folderTitle = req.body.folderTitle;
            user.folders[index].updateDate = getCurrentDate(new Date());
            console.log(user)
            mongoose.set('useFindAndModify', false);
            await UserTb
            .findOneAndUpdate({
                "userId": req.body.user_id
            }, user)
            .exec()
            .then(doc => {
                res.status(201).json("폴더 이름을 변경했습니다.")
            })


    }catch(e) {
        res.status(500).json({
            error: e
        });

    }
});

// 유저 폴더 지우기
router.delete('/userFlow', async (req, res, next) => {
    try {
        req.body.user_id = 'payment'
        const user = await UserTb
            .findOne({
                "userId": req.body.user_id
            })
            .exec()

            let index = 0
            let tmp = 0
            let ids = []
            user.folders.forEach(element => {
                ids.push(element._id.toString())
                if(element._id == req.query.folder_id) {
                    index = tmp;
                    console.log(element._id == req.query.folder_id)
                    console.log(index)
                }
                tmp++;
            });
            if(ids.includes(req.query.folder_id)){
                user.folders.splice(index,1);
                mongoose.set('useFindAndModify', false);
                await UserTb
                .findOneAndUpdate({
                    "userId": req.body.user_id
                }, user)
                .exec()
                .then(doc => {
                    res.status(201).json("폴더를 삭제했습니다.")
                })
            }else {
                res.status(200).json("해당 폴더를 찾을 수 없습니다.")
            }



    }catch(e) {
        res.status(500).json({
            error: e
        });

    }
});

// 즐겨찾기 한 가게 폴더에 추가
router.post('/favorite', async (req, res, next) => {
    try {
        req.body.user_id = 'payment';
        const user = await UserTb
        .findOne({
            "userId": req.body.user_id
        })
        .exec()
        //즐겨찾기에 포함된 가게인지 상태 검사
        let index = 0
        let tmp = 0
        user.folders.forEach(element => {
            if(element._id == req.body.folder_id) {
                index = tmp;
            }
            tmp++;
        });
        console.log(user.folders[index]);
        
        let i = 0
        tmp = 0
        let ids = []
        user.folders[index].stores.forEach(element => {
            ids.push(element.storeId)
            console.log(element.storeId == req.body.store_id.toString())
            if(element.storeId == req.body.store_id) {
                i = tmp;
            }
            tmp++;
        });
        if(!ids.includes(req.body.store_id.toString())) {
        //if(!storeLike) {
            let inputStore = null
            if(req.body.typeStore == "맛집") {
                inputStore = {
                    'ytbStoreTbId': req.body.store_id,
                    'attractionTbId': null,
                    'storeId': req.body.store_id,
                    'typeStore': req.body.typeStore
                }
            } else {
                inputStore = {
                    'ytbStoreTbId': null,
                    'attractionTbId': req.body.store_id,
                    'storeId': req.body.store_id,
                    'typeStore': req.body.typeStore
                }
            }
            user.folders[index].stores.push(inputStore);

            console.log(user)
            mongoose.set('useFindAndModify', false);
            await UserTb
            .findOneAndUpdate({
                "userId": req.body.user_id
            }, user)
            .exec()
            .then(doc => {
                res.status(201).json("즐겨찾기 추가했습니다.")
            })

        }else {
            res.status(200).json("이미 포함되어있는 가게입니다.")
        }



    }catch(e) {
        res.status(500).json({
            error: e
        });

    }
});


// 즐겨찾기 삭제
router.delete('/favorite', async (req, res, next) => {
    try {
        req.body.user_id = 'payment'
        const user = await UserTb
            .findOne({
                "userId": req.body.user_id
            })
            .exec()

            let index = 0
            let tmp = 0
            user.folders.forEach(element => {
                if(element._id == req.query.folder_id) {
                    index = tmp;
                }
                tmp++;
            });
            console.log(user.folders[index]);

            let i = 0
            tmp = 0
            let ids = []
            user.folders[index].stores.forEach(element => {
                ids.push(element.storeId)
                console.log(element.storeId == req.query.store_id.toString())
                if(element.storeId == req.query.store_id) {
                    i = tmp;
                }
                tmp++;
            });
            if(ids.includes(req.query.store_id.toString())) {
                user.folders[index].stores.splice(i,1)

                mongoose.set('useFindAndModify', false);
                await UserTb
                .findOneAndUpdate({
                    "userId": req.body.user_id
                }, user)
                .exec()
                .then(doc => {
                    res.status(201).json("즐겨찾기가 취소되었습니다.")
                })
    
            }else {
                res.status(400).json("해당 가게가 동선에 포함되어 있지 않습니다.")
            }


    }catch(e) {
        res.status(500).json({
            error: e
        });

    }
});


// 유저가 좋아요 한 동선
// 공유 동선 상세 페이지 정보
router.get('/shareFlow/like', async (req, res, next) => {
    mongoose.set('useFindAndModify', false);
    req.body.user_id = 'payment';

    const user = await UserTb.findOne({userId: req.body.user_id})
    .select('likeFlows')
    .exec();

    console.log(user);
    let ids = user.likeFlows.map(doc => doc)
    let flowLikeCheck =null;
     if(req.body.userId) { // 로그인이 되어 있을 때 
        flowLikeCheck = await UserTb.findOne({userId: req.body.userId})
        .select('likeFlows')
        .exec();
     }
    
    // 동선 제목, 썸네일, 해시태그, 
    await ShareFlowTb.find({_id: {$in: ids}})
    .select('_id')
    .select('shareTitle')
    .select('shareThumbnail')
    .select('folderId')
    .select('adminTag')
    .select('userTags')
    .exec()
    .then(docs => {
        res.status(200).json({
            count:docs.length,
            shareFlowTb: docs.map(doc => {

                return {
                _id: doc._id,
                shareTitle: doc.shareTitle,
                shareThumbnail: imgUrl + doc.shareThumbnail,
                //shareThumbnail: doc.shareThumbnail,
                adminTag: doc.adminTag,
                userTags: doc.userTags,
                folderId: doc.folderId,
                flowLike: true
            }})
        })
    })

})
module.exports = router;