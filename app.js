require('dotenv').config();
const express       = require('express');
const app           = express();
const passport      = require('passport');
const session       = require('express-session');
const mongoose      = require('mongoose');
const cors          = require('cors');

const PORT = 3000;

// 관리자용 로그인
const LocalStrategy = require('passport-local').Strategy
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended:false}))

// 관리자용 소켓
// const server = app.listen(1000, () => {
//   console.log('socket listening on port 1000!');
// });
// const io = require('socket.io')(server);

// io.on('connection', (socket) => {

//   socket.on('event1', (msg) => {
//     console.log(msg)
//   }); // Get message from the browser.

//   socket.emit('event2', 'message here'); // Send a message to browser.
// });

// test
// app.get('/test', function(req, res) {
//   res.send('<h1>hello world</h1>')
// })

// DB 연결
mongoose.connect(process.env.ATLAS_URI, 
{ useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });

const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
})

// 로그인 확인용
app.set('view engine', 'ejs');
app.use(session({secret:'MySecret', resave: false, saveUninitialized:true}));

// passport 세팅
app.use(passport.initialize());
app.use(passport.session());

// app.get('/', (req, res) => {
//     res.json({
//         success: true,
//     });
//  });

// 로그인 라우트
// app.use('/', require('./routes/main'));
// app.use('/auth', require('./routes/auth'));

// app.use(cors());
// app.use(express.json());
const auth = require('./routes/auth');

app.use(auth);

const loginRouter = require('./routes/db/passport');
const userTbRouter = require('./routes/db/userTb');
const adminTbRouter = require('./routes/db/adminTb');
const adminTagTbRouter = require('./routes/db/adminTagTb');
const userTagTbRouter = require('./routes/db/userTagTb');
const ytbReqTbRouter = require('./routes/db/ytbReqTb');
const ytbCrawlingTbRouter = require('./routes/db/ytbCrawlingTb');
const ytbStoreTbRouter = require('./routes/db/ytbStoreTb');
const ytbChannelTbRouter = require('./routes/db/ytbChannelTb');
const attractionCrawlingTbRouter = require('./routes/db/attractionCrawlingTb');
const attractionTbRouter = require('./routes/db/attractionTb');
const shareFlowTbRouter = require('./routes/db/shareFlowTb');
const searchTbRouter = require('./routes/db/searchTb');

app.use('/admin/login', loginRouter);
app.use('/admin/userTb', userTbRouter);
app.use('/admin/adminTb', adminTbRouter);
app.use('/admin/adminTagTb', adminTagTbRouter);
app.use('/admin/userTagTb', userTagTbRouter);
app.use('/admin/ytbReqTb', ytbReqTbRouter);
app.use('/admin/ytbCrawlingTb', ytbCrawlingTbRouter);
app.use('/admin/ytbStoreTb', ytbStoreTbRouter);
app.use('/admin/ytbChannelTb', ytbChannelTbRouter);
app.use('/admin/attractionCrawlingTb', attractionCrawlingTbRouter);
app.use('/admin/attractionTb', attractionTbRouter);
app.use('/admin/shareFlowTb', shareFlowTbRouter);
app.use('/admin/searchTb', searchTbRouter);

// 메인 api
const region = require('./routes/main/region');
const regionYtb = require('./routes/main/regionYtb');
const regionFlow = require('./routes/main/regionFlow');

app.use(region);
app.use(regionYtb);
app.use(regionFlow);

// 지도 api
const map = require('./routes/map/map');
const youtuberSearch = require('./routes/map/youtuberSearch');
const store = require('./routes/map/store');
const storeDetail = require('./routes/map/storeDetail')

app.use(map);
app.use(youtuberSearch);
app.use(store);
app.use(storeDetail);

// flow api
const flowSearch = require('./routes/flow/flowSearch');
const userFlow = require('./routes/flow/userFlow');
const shareFlow = require('./routes/flow/shareFlow');
const test = require('./routes/flow/test');


app.use(flowSearch);
app.use(userFlow);
app.use(shareFlow);
app.use(test);

// 유튜버 상세 페이지
const youtuber = require('./routes/youtuber/youtube');

app.use(youtuber);

// 이미지 업로드 확인용
const upload = require('./routes/flow/upload');

app.use(upload)

// 포트 연결
app.listen(PORT, function(){
  console.log('server on! http://localhost:'+ PORT);
});