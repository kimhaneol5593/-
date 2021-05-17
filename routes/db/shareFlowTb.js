const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const ShareFlowTb = require("../../models/shareFlowTb.model")
const algo = require("./algo")

// router.get('/', (req, res, next) => {
//     ShareFlowTb.find()
//     .select()
//     .populate('userTbId')
//     // .populate({
//     //     path: 'userTbId',
//     //     populate: { path: '' }
//     // })
//     .exec()
//     .then(docs => {
//         res.status(200).json({
//             count: docs.length,
//             shareFlowTb: docs.map(doc => {
//                 return {
//                     _id: doc._id,
//                     userTbId: doc.userTbId,
//                     userId: doc.userId,
//                     shareTitle: doc.shareTitle,
//                     shareThumbnail: doc.shareThumbnail,
//                     folderTitle: doc.folderTitle,
//                     adminTag: doc.adminTag,
//                     userTags: doc.userTags,
//                     shareDate: doc.shareDate,
//                     updateDate: doc.updateDate,
//                     likeCount: doc.likeCount,
//                     hits: doc.hits,
//                     request: {
//                         type: 'GET',
//                         url: 'http://localhost:3000/shareFlowTb/' + doc._id
//                     }
//                 }
//             })
//         });
        
//     })
//     .catch(err => {
//         res.status(500).json({
//             error: err
//         });
//     });
// });

// 전체 목록 불러오기 - 페이지네이션 적용
// router.get('/', async (req, res, next) => {
//     try {
//         const { page = 1, limit = 10 } = req.query;
//         const whole = await ShareFlowTb.find();        // shareFlowTb 전체 값

//         // 페이지네이션을 위한 몽고DB 쿼리
//         const shareFlowTb = await ShareFlowTb.find()
//         .limit(limit * 1)
//         .skip((page-1) * limit);

//         // 페이지 그룹
//         const pageCount = 5;                          // 페이지 그룹에 보일 페이지 수
//         var pageGroup = Math.ceil(page/pageCount);    // 현재 페이지 그룹 위치
//         const totalPage = Math.ceil(whole.length/limit);  // 전체 페이지 수

//         var last = pageGroup * pageCount;             // 화면에 보여질 페이지 맨 뒤 숫자
//         if (last > totalPage)
//             last = totalPage
//         var first = last - (pageCount - 1);           // 화면에 보여질 페이지 맨 앞 숫자
//         if (first < 1)
//             first = 1

//         var next = last + pageCount;
//         if (next > (totalPage/pageCount) * pageCount || next < pageCount + 1)
//             next = null;
//         var prev = first - pageCount;
//         if (prev < 1)
//             prev = null;

//         res.status(200).json({
//             total: whole.length,        // 전체 개수
//             current: shareFlowTb.length,// 현재 페이지 개수
//             totalPage : totalPage,      // 전체 페이지 숫자
//             page: page,                 // 현재 페이지
//             first: first,               // 화면에 보여질 페이지 맨 앞 숫자
//             last: last,                 // 화면에 보여질 페이지 맨 뒤 숫자
//             next: next,                 // 다음 버튼
//             prev: prev,                 // 이전 버튼
//             shareFlowTb
//         })
//     } catch (err) {
//         res.status(500).json({
//             error : err
//         })
//     }
// });

// 전체 목록 불러오기 - 페이지네이션 적용
router.get('/', async (req, res, next) => {
    try {
        algo.pagination(req, res, ShareFlowTb)
    } catch (err) {
        res.status(500).json({
            error : err
        })
    }
});

// shareFlowTb에서 제목으로 검색
// router.get('/title/:flowTitle', (req, res, next) => {
//     ShareFlowTb.find({shareTitle : req.params.flowTitle})
//     .exec()
//     .then(docs => {
//         res.status(200).json(docs);
//     })
//     .catch(err => {
//         res.status(500).json({
//             error: err
//         });
//     });
// });

// shareFlowTb에서 제목으로 검색 - 페이지네이션 적용
router.get('/title/:flowTitle', async (req, res, next) => {
    // try {
    //     const { page = 1, limit = 10 } = req.query;
    //     const shareFlowTb = await ShareFlowTb.find({shareTitle : req.params.flowTitle})
    //     .limit(limit * 1)
    //     .skip((page-1) * limit);

    //     // 데이터가 없을 때 에러 표시
    //     if (shareFlowTb.length == 0)
    //         res.status(404).json({ error : req.params.flowTitle + "is not founded" })
        
    //     res.status(200).json({ total: shareFlowTb.length, // 전체 값 숫자
    //         shareFlowTb
    //     })
    // } catch (err) {
    //     res.status(500).json({
    //         error : err
    //     })
    // }
    try {
        algo.paginationSearch(req, res, ShareFlowTb, 'shareTitle', req.params.flowTitle)
    } catch (err) {
        res.status(500).json({
            error : err
        })
    }
});

// shareFlowTb에서 아이디로 검색
// router.get('/id/:userId', (req, res, next) => {
//     ShareFlowTb.find({userId : req.params.userId})
//     .exec()
//     .then(docs => {
//         res.status(200).json(docs);
//     })
//     .catch(err => {
//         res.status(500).json({
//             error: err
//         });
//     });
// });

// shareFlowTb에서 아이디로 검색 - 페이지 네이션 적용
router.get('/id/:userId', async (req, res, next) => {
    // try {
    //     const {page = 1, limit = 10} = req.query;
    //     const shareFlowTb = await ShareFlowTb.find({userId : req.params.userId})
    //     .limit(limit * 1)
    //     .skip((page-1) * limit);
    //     res.status(200).json({ total: shareFlowTb.length, shareFlowTb })
    // } catch (err) {
    //     res.status(500).json({
    //         error : err
    //     })
    // }
    try {
        algo.paginationSearch(req, res, ShareFlowTb, 'userId', req.params.userId)
    } catch (err) {
        res.status(500).json({
            error : err
        })
    }
});

// shareFlowTb에서 지역으로 검색
// router.get('/region/:regionTag', (req, res, next) => {
//     ShareFlowTb.find({"adminTag.regionTag" : req.params.regionTag})
//     .exec()
//     .then(docs => {
//         res.status(200).json(docs);
//     })
//     .catch(err => {
//         res.status(500).json({
//             error: err
//         });
//     });
// });

// shareFlowTb에서 지역으로 검색 - 페이지네이션 적용
router.get('/region/:regionTag', async (req, res, next) => {
    // try {
    //     const {page = 1, limit = 10} = req.query;
    //     const shareFlowTb = await ShareFlowTb.find({"adminTag.regionTag" : req.params.regionTag})
    //     .limit(limit * 1)
    //     .skip((page-1) * limit);
    //     res.status(200).json({ total: shareFlowTb.length, shareFlowTb })
    // } catch (err) {
    //     res.status(500).json({
    //         error : err
    //     })
    // }
    try {
        algo.paginationSearch(req, res, ShareFlowTb, 'adminTag.regionTag', req.params.regionTag)
    } catch (err) {
        res.status(500).json({
            error : err
        })
    }
});

router.post('/', (req, res, next) => {
      const shareFlowTb = new ShareFlowTb({
        _id: new mongoose.Types.ObjectId(),
        userTbId: req.body.userTbId,
        userId: req.body.userId,
        shareTitle: req.body.shareTitle,
        shareThumbnail: req.body.shareThumbnail,
        folderId: req.body.folderId,
        adminTag: req.body.adminTag,
        userTags: req.body.userTags,
        shareDate: req.body.shareDate,
        updateDate: req.body.updateDate,
        likeCount: req.body.likeCount,
        hits: req.body.hits,
      });
      shareFlowTb.save()
      .then(result => {
        console.log(result);
        res.status(201).json({
            message: 'shareFlowTb stored',
            createdShareFlowTb: {
                _id: result._id,
                userTbId: result.userTbId,
                userId: result.userId,
                shareTitle: result.shareTitle,
                shareThumbnail: result.shareThumbnail,
                folderId: result.folderId,
                adminTag: result.adminTag,
                userTags: result.userTags,
                shareDate: result.shareDate,
                updateDate: result.updateDate,
                likeCount: result.likeCount,
                hits: result.hits,
            },
            request: {
                type: 'POST',
                url: 'http://localhost:3000/shareFlowTb/' + result._id
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

module.exports = router;