const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const AdminTb = require('../../models/adminTb.model');

// passport.use(new LocalStrategy({ // local 전략을 세움
//     usernameField: 'adminId',
//     passwordField: 'adminPw',
//     session: true, // 세션에 저장 여부
//     passReqToCallback: false,
//   }, (adminId, adminPw, done) => {
//   AdminTb.findOne({ userId: adminId }, async (findError, user) => {
//     const pw = await AdminTb.findOne({userId: adminId});
//     if (adminId == pw.userId && adminPw == pw.password)
//         return done(null, user); // 검증 성공
//   })
// }))
  
// passport.serializeUser((user, done) => { // Strategy 성공 시 호출됨
//     done(null, user); // 여기의 user가 deserializeUser의 첫 번째 매개변수로 이동
// });
  
// passport.deserializeUser((user, done) => { // 매개변수 user는 serializeUser의 done의 인자 user를 받은 것
//     done(null, user); // 여기의 user가 req.user가 됨
// });

// module.exports = passport
    

module.exports = () => {
    passport.use(new LocalStrategy({ // local 전략을 세움
        usernameField: 'adminId',
        passwordField: 'adminPw',
        session: true, // 세션에 저장 여부
        passReqToCallback: false,
      }, (adminId, adminPw, done) => {
      AdminTb.findOne({ userId: adminId }, async (findError, user) => {
        const pw = await AdminTb.findOne({userId: adminId});
        if (adminId == pw.userId && adminPw == pw.password)
            return done(null, user); // 검증 성공
      })
      }))
      
      passport.serializeUser((user, done) => { // Strategy 성공 시 호출됨
        done(null, user); // 여기의 user가 deserializeUser의 첫 번째 매개변수로 이동
      });
      
      passport.deserializeUser((user, done) => { // 매개변수 user는 serializeUser의 done의 인자 user를 받은 것
        done(null, user); // 여기의 user가 req.user가 됨
      });
      
      app.post('/admin/login', passport.authenticate('local', {
        failureRedirect: '/login', failureFlash: true
      }), // 인증 실패 시 401 리턴, {} -> 인증 스트레티지
        function (req, res) {
          // res.redirect('/home');
          res.json({
            success: true,
          });
      });
};

// const AdminTb = require('./models/adminTb.model');

// passport.use(new LocalStrategy({ // local 전략을 세움
//   usernameField: 'adminId',
//   passwordField: 'adminPw',
//   session: true, // 세션에 저장 여부
//   passReqToCallback: false,
// }, (adminId, adminPw, done) => {
// AdminTb.findOne({ userId: adminId }, async (findError, user) => {
//   const pw = await AdminTb.findOne({userId: adminId});
//   if (adminId == pw.userId && adminPw == pw.password)
//       return done(null, user); // 검증 성공
// })
// }))

// passport.serializeUser((user, done) => { // Strategy 성공 시 호출됨
//   done(null, user); // 여기의 user가 deserializeUser의 첫 번째 매개변수로 이동
// });

// passport.deserializeUser((user, done) => { // 매개변수 user는 serializeUser의 done의 인자 user를 받은 것
//   done(null, user); // 여기의 user가 req.user가 됨
// });



// app.js
// const adminPassport = require('./routes/db/passport')

// app.post('/admin/login', passport.authenticate('local', {
//   failureRedirect: '/login', failureFlash: true
// }), // 인증 실패 시 401 리턴, {} -> 인증 스트레티지
//   function (req, res) {
//     // res.redirect('/home');
//     res.json({
//       success: true,
//     });
// });