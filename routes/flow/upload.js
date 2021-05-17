const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const s3 = require('../../config/s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const fs = require('fs'); // 설치 x
const path = require('path'); // 설치 x
const AWS = require('aws-sdk');
;
// 이미지 업로드
const upload = multer({
    storage : multerS3({
        s3:s3,
        bucket:'test-gurume',
        key : function(req, file, cb) {
            var filename = 'test1';
            var ext = file.mimetype.split('/')[1];
            if(!['png', 'jpg', 'jpeg', 'gif', 'bmp'].includes(ext)) {
                return cb(new Error('Only images are allowed'));
            }
            cb(null, filename + '.jpg');
        }
    }),
    acl : 'public-read-write'
});

// const remove = s3.deleteObject({
//     Bucket : 'test-gurume',
//     Key: 'test1'
//   }, function(err, data){});

router.post('/post/img', upload.single('img'), (req, res) => {
    try {
        console.log("req.file: ", req.file);

        let payLoad = { url: req.file.location };
        res.status(200).json({
            url: payLoad,
            test : req.body.test
            
        
        })
    } catch (err) {
        console.log(err);
        res.status(500).json("서버에러")
    }
});

router.delete('/delete/img', (req, res, next) => {
    try {
        s3.deleteObject({
            Bucket: 'test-gurume', // 사용자 버켓 이름
            Key: 'test1.jpg' // 버켓 내 경로
          }, (err, data) => {
            if (err) { throw err; }
            console.log('s3 deleteObject ', data)
          })
        res.status(200).json("success")
    } catch (err) {
        console.log(err);
        res.status(500).json("서버에러")
    }
})

router.get('/image', (req, res, next) => {
    fs.readFile('https://test-gurume.s3.ap-northeast-2.amazonaws.com/test1.jpg', function(error, data) {
        res.writeHead(200, {'Content-Type' : 'image/jpeg'});
        res.end(data);
    })

})

module.exports = router;