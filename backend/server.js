// server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 5000;

// 로그 데이터 스키마 정의
const tlsSchema = new mongoose.Schema({
  timestamp: String,                     
  srcip: String,                     
  dstip: String,                     
  encryptionstatus: Number,                     
  tlsversion: String,                     
  cipherSuite: String,                     
  certsignature: String,                     
  curvename: String,                     
  skesignature: String,                     
  tlsvervul: Number,                     
  ciphersuitevul: String,                     
  certvul: Number,                     
  curvevul: Number,                     
  skesigvul: Number,                     
});

// 키 데이터 스키마 정의
const keyDataSchema = new mongoose.Schema({
  client: String,
  sans: String,
  ttl: String,
  status: String,
});

// MongoDB 모델 생성
const LogData = mongoose.model('tls', tlsSchema);
const KeyData = mongoose.model('istio', keyDataSchema);

var Mongoose = require('mongoose/lib').Mongoose;

// MongoDB 연결
const dbUri = 'mongodb://test:1234@10.10.0.102:30027/?directConnection=true'; // 수정된 부분
mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
//mongoose.connect('mongodb://admin:1234@10.10.0.102:30027', { }) // @todo Modify here, use clusterip(ns.svc:port) instead of nodeport
//mongoose.connect('mongodb://admin:1234@10.10.0.102:30027/admin', {

.then(() => {
  console.log("MongoDB connected successfully");
  let listOfCollections = Object.keys(mongoose.connection.collections);
  let listofDBS = Object.keys(mongoose.connection.db)
  let listof = Object.keys(mongoose.connection.createCollection)
  console.log(listOfCollections)
  console.log(listofDBS)
  console.log(listof)
})
.catch(err => {
  console.error("MongoDB connection error:", err);
});

console.log('hello')

app.use((req, res, next) => {
  res.append('Access-Control-Allow-Origin', ['*']);
  res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.append('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// CORS 설정
console.log('cors effected2')
app.use(cors({
  origin: "*",//origin: "http://10.10.0.151:3000", // 접근 권한을 부여하는 도메인
  credentials: true, // 응답 헤더에 Access-Control-Allow-Credentials 추가
  optionsSuccessStatus: 200, // 응답 상태 200으로 설정
}));

// API 엔드포인트: 모든 로그 데이터 가져오기
app.get('/api/logdata', cors(), async (req, res) => {
  try {
    const logData = await LogData.find(); // 모든 로그 데이터를 가져옴
    // console.log(logData)
    res.json(logData); // 클라이언트에게 JSON 형식으로 응답
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

console.log('hello')
    // let listOfCollections = Object.keys(mongoose.connection.collections);
    // let listofDBS = Object.keys(mongoose.connection.db)
    // console.log(listOfCollections)
    // console.log(listofDBS)

// API 엔드포인트: 모든 키 데이터 가져오기
app.get('/api/keydata', cors(), async (req, res) => {
  try {
    const keyData = await KeyData.find(); // 모든 키 데이터를 가져옴
    let listOfCollections = Object.keys(mongoose.connection.collections);
    let listofDBS = Object.keys(mongoose.connection.db)
    console.log(listOfCollections)
    console.log(listofDBS)
    mongoose.connection.collection()
    
    console.log(keyData)
    res.json(keyData); // 클라이언트에게 JSON 형식으로 응답
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

console.log('hello')
// Socket.io 설정
io.on('connection', (socket) => {
  console.log('a user connected');
  // console.log(tls.tlsversion)


  // MongoDB change streams 사용
  const logDataChangeStream  = LogData.watch();
  logDataChangeStream.on('change', (change) => {
    // console.log(tls.tlsversion)
    console.log('tls change:', change);
    // 변경된 데이터를 클라이언트에 전송
    io.emit('logDataChange', change.fullDocument); // 전체 문서 전달 예시
  });

  const keyDataChangeStream = KeyData.watch();
  keyDataChangeStream.on('change', (change) => {
    console.log('KeyData change:', change);
    // 변경된 데이터를 클라이언트에 전송
    io.emit('keyDataChange', change.fullDocument); // 전체 문서 전달 예시
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    logDataChangeStream.close();
    keyDataChangeStream.close();
    // mongoose.connection.close();
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on localhost:${PORT}`);
});
