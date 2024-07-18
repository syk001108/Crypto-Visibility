import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import NetworkTopology from '../components/NetworkTopology';
import './Topology.css';
import './CommonTable.css';
import Sidebar from '../components/Sidebar';
import { CDBTable, CDBTableHeader, CDBTableBody } from "cdbreact";

const Topology = () => {
  const [logData, setLogData] = useState([]);
  const [currentPage] = useState(1);
  const rowsPerPage = 5;

  useEffect(() => {
    // 데이터 초기 로딩 함수
    const fetchLogData = async () => {
      try {
        const response = await axios.get('http://10.10.0.151:5000/api/logdata');
        setLogData(response.data.reverse());
      } catch (error) {
        console.error('Error fetching log data:', error);
      }
    };

    // 페이지 로딩 시 데이터 초기 로딩
    fetchLogData();

    // 웹소켓 설정
    const socket = io('http://10.10.0.151:5000',{
      cors: { origin: '*' }
    });
    
    // 데이터 변경 시 처리
    socket.on('logDataChange', (changedDocument) => {
      console.log('Log data changed:', changedDocument);

      // 변경된 데이터를 state에 반영
      setLogData(prevLogData => [changedDocument, ...prevLogData]);
    });

    // 데이터 주기적 업데이트를 위한 Interval 설정

    // 컴포넌트 언마운트 시 웹소켓 및 Interval 정리
    return () => {
      socket.disconnect();
    };
  }, []);

  // 데이터 처리 함수: 중복 제거 및 최신 데이터 선택
  const processLogData = (data) => {
    // 중복 제거를 위한 Map
    const logMap = new Map();

    // 최신 데이터 선택
    data.forEach(item => {
      const key = `${item.source}-${item.destination}`;
      if (!logMap.has(key)) {
        logMap.set(key, item);
      } else {
        // 이미 존재하는 데이터보다 최신인지 비교 후 갱신
        if (new Date(item.date) > new Date(logMap.get(key).date)) {
          logMap.set(key, item);
        }
      }
    });

    // Map의 값들만 배열로 변환하여 반환
    return Array.from(logMap.values());
  };

  // 최신 데이터를 처리한 후의 로그 데이터
  const processedLogData = processLogData(logData);

  // 고유 노드 추출
  const uniqueNodes = Array.from(new Set(processedLogData.map(item => item.source).concat(processedLogData.map(item => item.destination)))).map((item, index) => ({
    id: `Node${index + 1}`,
    name: item
  }));

  // NetworkTopology로 전달할 links 배열
  const networkTopologyLinks = processedLogData.map(item => ({
    source: uniqueNodes.find(node => node.name === item.source),
    target: uniqueNodes.find(node => node.name === item.destination),
    encryptionStatus: item.encryptionStatus,
    tlsVersion: item.tlsVersion,
    cipherSuite: item.cipherSuite,
    certSignatureAlgorithm: item.certSignatureAlgorithm,
    ellipticCurve: item.ellipticCurve,
    skeSignatureAlgorithm: item.skeSignatureAlgorithm,
    metadata: [
      item.tlsVersionVulnerability,
      item.cipherSuiteVulnerability,
      item.certSignatureAlgorithmVulnerability,
      item.ellipticCurveVulnerability,
      item.skeSignatureAlgorithmVulnerability
    ],
  }));

  // 테이블에 전달할 원본 데이터 배열
  const originalLogData = logData.slice(0, rowsPerPage);

  return (
    <div className="Topology">
      <Sidebar />
      <div className="Topology-content">
        <header className="Topology-header">
          <h3>Topology</h3>
        </header>
        <div className="Topology-body">
          <NetworkTopology nodes={uniqueNodes} links={networkTopologyLinks} />
        </div>
        <div className="CommonLayout">
          <CDBTable responsive>
            <div className="table">
              <CDBTableHeader>
                <tr style={{ verticalAlign: "middle" }}>
                  <th>Date</th>
                  <th>Source</th>
                  <th>Destination</th>
                  <th>TLS Version</th>
                  <th>Cipher Suite</th>
                  <th>Cert Signature Algorithm</th>
                  <th>Elliptic Curve</th>
                  <th>SKE Signature Algorithm</th>
                </tr>
              </CDBTableHeader>
              <CDBTableBody>
                {originalLogData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.date}</td>
                    <td>{item.source}</td>
                    <td>{item.destination}</td>
                    <td>{item.tlsVersion}</td>
                    <td>{item.cipherSuite}</td>
                    <td>{item.certSignatureAlgorithm}</td>
                    <td>{item.ellipticCurve}</td>
                    <td>{item.skeSignatureAlgorithm}</td>
                  </tr>
                ))}
              </CDBTableBody>
            </div>
          </CDBTable>
        </div>
      </div>
    </div>
  );
}

export default Topology;
