
require('dotenv').config;
const passport         = require('passport');
const GoogleStrategy   = require('passport-google-oauth2').Strategy;
const passportGoogleToken = require('passport-google-token');
const User = require('../models/userTb.model');
const mongoose = require('mongoose');


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
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use( new GoogleStrategy(
  {
    clientID      : process.env.GOOGLE_CLIENT_ID,
    clientSecret  : process.env.GOOGLE_SECRET,
    callbackURL   : '/auth/google/callback',
    //passReqToCallback   : true
  }, (accessToken, refreshToken, profile, done) => {
    // token 유효성 검사
    if(req.body.refreshToken == refreshToken) {

    }
    const googleID = profile.id;
    console.log(req.obj);
    // 유저 객체 만들기
    const newUser = {
      _id: new mongoose.Types.ObjectId(),
      userId: googleID,
      social: profile.provider,
      nickname: profile.displayName,
      photoUrl: profile.photos[0].value,
      memo: '',
      loginToken: refreshToken,
      likeYoutuber: [],
      likeFlows: [],
      folders: [{
        folderTitle: "default",
        createDate: getCurrentDate(),
        updateDate: null,
        stores: []
      }]
    };
    console.log(accessToken)
    console.log(refreshToken)

  // user가 db에 없다면 새로 저장하기
    User.findOne({loginToken : refreshToken}).then((user) => {
      if(!user){
        console.log(newUser);
        new User(newUser).save().then((createdUser) => {
          
          console.log('User: ', createdUser);
          done(null, createdUser);
        })
        .catch((err) => {
          console.log('Error', err);
          done(err, null);
        });
        
        done(null, newUser)
      }
      else {
        console.log('Already exists', user);        
        done(null, user);
      }
    })
    .catch((err) => {
      console.log('Error', err);      
      done(err, null);
    });
  }
));


module.exports = passport;