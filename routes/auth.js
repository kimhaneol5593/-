require('dotenv').config;
const express  = require('express');
const { OAuth2Client, GoogleAuth } = require('google-auth-library');
const router   = express.Router();
const passport = require('../config/passport.js');
const passportGoogleToken = require('passport-google-token');
const clientID = process.env.FRONTEND_GOOGLE_CLIENT_ID
const mongoose = require('mongoose');



const UserTb = require('../models/userTb.model');

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

router.get('/login', function(req,res){
  res.render('auth/login');
});

router.get('/logout', function(req, res) {
  req.logout();
  res.status(200).json("success");
});

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email']})
);

// router.post('/google/callback', passport.authenticate('google-token'),
//   (req, res, next) => {
//     res.status(200).json(req.user)
//   })

router.get('/google/callback',async (req, res, next) => {
  const auth = new GoogleAuth();
  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_SECRET, 
    '/auth/google/callback'
    );
  async function verify(idToken, clientID) {
    console.log(clientID)
    const ticket = await client.verifyIdToken({
      idToken : idToken,
      audience: clientID
    });
    
    const payload = ticket.getPayload();
    // 유저 객체 만들기
    const newUser = {
      _id: new mongoose.Types.ObjectId(),
      userId: payload.email,
      social: 'Google',
      nickname: payload.name,
      photoUrl: payload.picture,
      memo: '',
      loginToken: null,
      likeYoutuber: [],
      likeFlows: [],
      folders: [{
        folderTitle: "default",
        createDate: getCurrentDate(),
        updateDate: null,
        stores: []
      }]
    };
    console.log(newUser)
    // db에 객체 저장되어 있는지 확인
    UserTb.findOne({userId : payload.email}).then((user) => {
      if(!user){
        console.log(newUser);
        new UserTb(newUser).save().then((createdUser) => {
          
          return res.status(201).json("로그인이 완료되었습니다.")
        })
        .catch((err) => {
          return res.status(400).json("회원가입에 실패하였습니다.");
        });
      }
      else {
        return res.status(201).json("로그인이 완료되었습니다.")
      }
    })
    .catch((err) => {
      return res.status(400).json("DB에서 사용자 정보를 검색할 수 없습니다.")
    });
  }

verify(req.query.idToken, clientID)            
.catch(err => {
  res.status(400).json("id Token이 만료되었습니다.");
});;

}
  //const idToken = req.body.idToken;

);

router.get("/current_user", (req, res) => { 
  res.send(req.user); 
});


function authSuccess(req, res) {
  res.status(200).json("success")
}

module.exports = router;