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
    const socket = io('http://10.10.0.151:5000',{transports: ['websocket']});
    
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
      const key = `${item.srcip}-${item.dstip}`;
      if (!logMap.has(key)) {
        logMap.set(key, item);
      } else {
        // 이미 존재하는 데이터보다 최신인지 비교 후 갱신
        if (new Date(item.timestamp) > new Date(logMap.get(key).timestamp)) {
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
  const uniqueNodes = Array.from(new Set(processedLogData.map(item => item.srcip).concat(processedLogData.map(item => item.dstip)))).map((item, index) => ({
    id: `Node${index + 1}`,
    name: item,
    x: Math.random() * 1000, // 임의의 x 좌표값 설정
    y: Math.random() * 1000  // 임의의 y 좌표값 설정
  }));

  // NetworkTopology로 전달할 links 배열
  const networkTopologyLinks = processedLogData.map(item => ({
    srcip: uniqueNodes.find(node => node.name === item.srcip),
    dstip: uniqueNodes.find(node => node.name === item.dstip),
    encryptionstatus: item.encryptionstatus,
    tlsversion: item.tlsversion,
    keyexchange: item.keyexchange,
    authentication: item.authentication,
    bulkencryption: item.bulkencryption,
    hash: item.hash,
    certsignature: item.certsignature,
    curvename: item.curvename,
    skesignature: item.skesignature,
    metadata: [
      item.tlsvervul,
      item.ciphersuitevul,
      item.ciphersuitevul,
      item.ciphersuitevul,
      item.ciphersuitevul,
      item.certvul,
      item.curvevul,
      item.skesigvul
    ],
  }));

  // 테이블에 전달할 원본 데이터 배열
  const originalLogData = logData.slice(0, rowsPerPage);

  return (
    <div className="Topology">
      
      <div className="Topology-content">
        <Sidebar />
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
                  <th>Key Exchange</th>
                  <th>Authentication</th>
                  <th>Bulk Encryption</th>
                  <th>Hash</th>
                  <th>Cert Signature Algorithm</th>
                  <th>Elliptic Curve</th>
                  <th>SKE Signature Algorithm</th>
                </tr>
              </CDBTableHeader>
              <CDBTableBody>
                {originalLogData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.timestamp}</td>
                    <td>{item.srcip}</td>
                    <td>{item.dstip}</td>
                    <td>{item.tlsversion}</td>
                    <td>{item.keyexchange}</td>
                    <td>{item.authentication}</td>
                    <td>{item.bulkencryption}</td>
                    <td>{item.hash}</td>
                    <td>{item.certsignature}</td>
                    <td>{item.curvename}</td>
                    <td>{item.skesignature}</td>
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
