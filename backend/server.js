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

// MongoDB 연결
mongoose.connect('mongodb://localhost:27017/mydatabase', {
}).then(() => {
  console.log("MongoDB connected successfully");
}).catch(err => {
  console.error("MongoDB connection error:", err);
});

console.log('hello')
// 로그 데이터 스키마 정의
const logDataSchema = new mongoose.Schema({
  date: String,
  source: String,
  destination: String,
  encryptionStatus: String,
  tlsVersion: String,
  cipherSuite: String,
  certSignatureAlgorithm: String,
  ellipticCurve: String,
  skeSignatureAlgorithm: String,
  tlsVersionVulnerability: Number,
  cipherSuiteVulnerability: Number,
  certSignatureAlgorithmVulnerability: Number,
  ellipticCurveVulnerability: Number,
  skeSignatureAlgorithmVulnerability: Number,
});

// 키 데이터 스키마 정의
const keyDataSchema = new mongoose.Schema({
  date: String,
  sans: String,
  ttl: String,
  client: String,
  status: String,
});

// MongoDB 모델 생성
const LogData = mongoose.model('LogData', logDataSchema);
const KeyData = mongoose.model('KeyData', keyDataSchema);

// CORS 설정
app.use(cors());

// API 엔드포인트: 모든 로그 데이터 가져오기
app.get('/api/logdata', async (req, res) => {
  try {
    const logData = await LogData.find(); // 모든 로그 데이터를 가져옴
    res.json(logData); // 클라이언트에게 JSON 형식으로 응답
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

console.log('hello')
// API 엔드포인트: 모든 키 데이터 가져오기
app.get('/api/keydata', async (req, res) => {
  try {
    const keyData = await KeyData.find(); // 모든 키 데이터를 가져옴
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

  // MongoDB change streams 사용
  const logDataChangeStream = LogData.watch();
  logDataChangeStream.on('change', (change) => {
    console.log('LogData change:', change);
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
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
