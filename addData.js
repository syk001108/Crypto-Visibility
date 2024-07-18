// 데이터 삽입 스크립트 예시
const mongoose = require('mongoose');

// MongoDB 연결 설정
mongoose.connect('mongodb://localhost:27017/mydatabase');

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

// MongoDB 모델 생성
const LogData = mongoose.model('LogData', logDataSchema);

// 예시 데이터
const logData = [
  {
    "date": "2024-07-16 18:20:29",
    "source": "a",
    "destination": "b",
    "encryptionStatus": "Insecure",
    "tlsVersion": "TLS 1.2",
    "cipherSuite": "TLS_ECdCBC_SHA",
    "certSignatureAlgorithm": "C",
    "ellipticCurve": "X25519",
    "skeSignatureAlgorithm": "ECDSSHA256",
    "tlsVersionVulnerability": 1,
    "cipherSuiteVulnerability": 0,
    "certSignatureAlgorithmVulnerability": 1,
    "ellipticCurveVulnerability": 0,
    "skeSignatureAlgorithmVulnerability": 0,
  },
];

// 로그 데이터 스키마 정의
const keyDataSchema = new mongoose.Schema({
  date: String,
  sans: String,
  ttl: String,
  client: String,
  status: String,
});

// MongoDB 모델 생성
const KeyData = mongoose.model('KeyData', keyDataSchema);

// 예시 데이터
const keyData = [
  {
    date: '2024-07-16 18:28:43',
    sans: 'spiffe://cluster.local/ns/default/sa/web',
    ttl: '12h0m0s',
    client: 'a',
    status: 'Created',
  },
];

// 데이터 삽입 함수
async function insertData() {
  try {
    // logData 삽입
    const insertedLogData = await LogData.insertMany(logData);
    console.log('Inserted log data:', insertedLogData);

    // keyData 삽입
    const insertedKeyData = await KeyData.insertMany(keyData);
    console.log('Inserted key data:', insertedKeyData);
  } catch (error) {
    console.error('Error inserting data:', error);
  } finally {
    // 연결 종료
    mongoose.disconnect();
  }
}

// 데이터 삽입 실행
insertData();
