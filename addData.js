// 데이터 삽입 스크립트 예시
const mongoose = require('mongoose');

// MongoDB 연결 설정
mongoose.connect('mongodb://localhost:27017/mydatabase');
/*
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
*/
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
/*
const keyData = [
  {
    date: '2024-07-16 18:28:43',
    sans: 'spiffe://cluster.local/ns/default/sa/web',
    ttl: '12h0m0s',
    client: 'a',
    status: 'Created',
  },
];
*/
const keyData = [
  {
    date: '2024-07-18 18:28:37',
    sans: 'spiffe://cluster.local/ns/istio-system/sa/istio-ingressgateway-service-account',
    ttl: '12h0m0s',
    client: 'Pod/istio-system/istio-ingressgateway-76594f5654-zlddx.istio-system',
    status: 'Generating',
  },
  {
    date: '2024-07-18 18:28:38',
    sans: 'spiffe://cluster.local/ns/istio-system/sa/istio-ingressgateway-service-account',
    ttl: '12h0m0s',
    client: 'Pod/default/auth-58b557ffd8-zjxn7',
    status: 'Generating',
  },
  {
    date: '2024-07-18 18:28:39',
    sans: 'spiffe://cluster.local/ns/istio-system/sa/istio-ingressgateway-service-account',
    ttl: '12h0m0s',
    client: 'Pod/default/backend-585ddcb876-xlgk7',
    status: 'Generating',
  },
  {
    date: '2024-07-18 18:28:39',
    sans: 'spiffe://cluster.local/ns/istio-system/sa/istio-ingressgateway-service-account',
    ttl: '12h0m0s',
    client: 'Pod/default/payment-548d5f7884-wjmn4',
    status: 'Generating',
  },
  {
    date: '2024-07-18 18:28:40',
    sans: 'spiffe://cluster.local/ns/istio-system/sa/istio-ingressgateway-service-account',
    ttl: '12h0m0s',
    client: 'Pod/test/ubuntu-688958d5c9-ts5hf',
    status: 'Terminated',
  },
  {
    date: '2024-07-18 18:28:40',
    sans: 'spiffe://cluster.local/ns/istio-system/sa/istio-ingressgateway-service-account',
    ttl: '12h0m0s',
    client: 'Pod/test/controller-c45f864fc-zm778',
    status: 'Terminated',
  },
  {
    date: '2024-07-18 18:28:41',
    sans: 'spiffe://cluster.local/ns/istio-system/sa/istio-ingressgateway-service-account',
    ttl: '0h0m10s',
    client: 'Pod/default/backend-585ddcb876-xlgk7',
    status: 'Signed',
  },
  {
    date: '2024-07-18 18:28:44',
    sans: 'spiffe://cluster.local/ns/istio-system/sa/istio-ingressgateway-service-account',
    ttl: '12h0m0s',
    client: 'Pod/test/solution-mr2rf',
    status: 'Terminated',
  },
  {
    date: '2024-07-18 18:28:44',
    sans: 'spiffe://cluster.local/ns/istio-system/sa/istio-ingressgateway-service-account',
    ttl: '12h0m0s',
    client: 'Pod/default/payment-548d5f7884-wjmn4',
    status: 'Generating',
  },
  {
    date: '2024-07-18 18:28:45',
    sans: 'spiffe://cluster.local/ns/istio-system/sa/istio-ingressgateway-service-account',
    ttl: '12h0m0s',
    client: 'Pod/istio-system/istio-ingressgateway-76594f5654-zlddx.istio-system',
    status: 'Signed',
  },
    {
    date: '2024-07-18 18:28:45',
    sans: 'spiffe://cluster.local/ns/istio-system/sa/istio-ingressgateway-service-account',
    ttl: '12h0m0s',
    client: 'Pod/default/auth-58b557ffd8-zjxn7',
    status: 'Signed',
  },
  {
    date: '2024-07-18 18:28:49',
    sans: 'spiffe://cluster.local/ns/istio-system/sa/istio-ingressgateway-service-account',
    ttl: '12h0m0s',
    client: 'Pod/default/payment-548d5f7884-wjmn4',
    status: 'Signed',
  },
  {
    date: '2024-07-18 18:28:50',
    sans: 'spiffe://cluster.local/ns/istio-system/sa/istio-ingressgateway-service-account',
    ttl: '12h0m0s',
    client: 'Pod/default/payment-548d5f7884-wjmn4',
    status: 'Signed',
  },
  {
    date: '2024-07-18 18:28:51',
    sans: 'spiffe://cluster.local/ns/istio-system/sa/istio-ingressgateway-service-account',
    ttl: '12h0m0s',
    client: 'Pod/default/backend-585ddcb876-xlgk7',
    status: 'Regenerating',
  },
  {
    date: '2024-07-18 18:28:51',
    sans: 'spiffe://cluster.local/ns/istio-system/sa/istio-ingressgateway-service-account',
    ttl: '12h0m0s',
    client: 'Pod/default/backend-585ddcb876-xlgk7',
    status: 'Signed',
  },
];
// 데이터 삽입 함수
async function insertData() {
  try {
    // logData 삽입
    //const insertedLogData = await LogData.insertMany(logData);
    //console.log('Inserted log data:', insertedLogData);

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
