# 실행

## 서버 실행
```
cd backend
node server.js
```

## 프론트 실행
```
cd frontend
npm start
```

# 패키지 설치

## 서버 측 (Node.js)
Express.js: 웹 애플리케이션 및 HTTP 서버를 구성하기 위한 Node.js 웹 프레임워크입니다.

### 설치 명령어:
```
npm install express
```

### 설치 명령어:
```
npm install socket.io
```
Mongoose: MongoDB와 Node.js 간의 데이터 모델링을 지원하는 ODM(Object Data Modeling) 라이브러리입니다. MongoDB와의 연결 및 데이터 모델 정의에 사용됩니다.

### 설치 명령어:
```
npm install mongoose
```
## 클라이언트 측 (React)
Socket.io-client: 클라이언트 측에서 Socket.io를 사용하기 위한 라이브러리입니다.
### 설치 명령어:
```
npm install socket.io-client
```
위 패키지들은 각각의 역할에 맞게 설치하여 사용하시면 됩니다. Node.js 환경에서는 npm을 주로 사용하지만, yarn을 사용하셔도 무방합니다. 설치 후에는 각 패키지의 API 문서나 사용 예시를 참고하시면 됩니다.

backend 폴더
```
npm install express mongoose cors socket.io
```
frontend 폴더
```
npm install axios socket.io-client d3 cdbreact
```

