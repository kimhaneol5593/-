require('dotenv').config;
const express  = require('express');
const { OAuth2Client, GoogleAuth } = require('google-auth-library');
const clientID = process.env.FRONTEND_GOOGLE_CLIENT_ID
const mongoose = require('mongoose');

const UserTb = require('../models/userTb.model');

// 로그인 확인 미들웨어
module.exports = async function authenticateUser(req, res, next){
    const auth = new GoogleAuth();
    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_SECRET, 
      '/auth/google/callback'
    );
    // id Token 유효성 검사
    async function verify(idToken, clientID) {
      console.log(clientID)
      const ticket = await client.verifyIdToken({
        idToken : idToken,
        audience: clientID
      });

      // 검사한 아이디 정보 반환
      const payload = ticket.getPayload();
      // 로그인한 userId값 반환
      const userInfo = await UserTb.find({userId : payload.email})
      .select('userId')
      .exec()

      return userInfo;
    }
  
	if (req.query.idToken) {
	    verify(req.query.idToken, clientID)            
        .catch(err => {
            res.status(400).json("id Token이 만료되었습니다.");
        });
	} else {
	  res.status(301).json("로그인이 필요합니다.");
	}
  };

