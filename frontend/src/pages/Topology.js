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
      //item.ciphersuitevul,
      //item.ciphersuitevul,
      //item.ciphersuitevul,
      item.ciphersuitevul,
      item.certvul,
      item.curvevul,
      item.skesigvul
    ],
  }));

  // 테이블에 전달할 원본 데이터 배열
  const originalLogData = logData.slice(0, rowsPerPage);

  // 빈 부분에 삭선(암호화 되었을 때) or 암호화 되지 않음 표시
  const blankLine = (tlsVer, String) => {
    if (String === '') {
      if (tlsVer === ''){
        return 'Not Encrypted';
      }
      return '-';
    }
    return String;
  }

  // Namespace와 Name으로 분리
  const seperateName = (String) => {
    const parts = String.split(' / ');

    return {
      part1: parts[0] || '', // 첫 번째 부분 (빈 문자열로 기본값 설정)
      part2: parts[1] || ''  // 두 번째 부분 (빈 문자열로 기본값 설정)
    };
  }

  // 숫자로 된 암호화 상태 문자로 변경
  const encryptionStatus = (Int) => {
    if (Int === 0) {
      return 'Encrypted';
    }
    if (Int === 1) {
      return 'Weakly Encrypted';
    }
    return 'Not Encrypted';
  }

  return (
    <div className="Topology">
      <div className="Topology-content">
      <Sidebar />
        <div className="Topology-body">
          <NetworkTopology nodes={uniqueNodes} links={networkTopologyLinks} />
        </div>
        <div className="CommonLayout">
          <CDBTable responsive>
            <div className="table">
              <CDBTableHeader>
                <tr style={{ verticalAlign: "middle" }}>
                <th>Date</th>
                  <th>TLS Version</th>
                  <th>Source Namespace</th>
                  <th>Source</th>
                  <th>Destination Namespace</th>
                  <th>Destination</th>
                  <th>Key Exchange</th>
                  <th>Authentication Mechanism</th>
                  <th>Bulk Encryption</th>
                  <th>Hash</th>
                  <th>Signature</th>
                  <th>Certificate Signature</th>
                  <th>Certificate ECC</th>
                  <th>Encryption Status</th>
                </tr>
              </CDBTableHeader>
              <CDBTableBody>
                {originalLogData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.timestamp}</td>
                    <td>{blankLine(item.tlsversion, item.tlsversion)}</td>
                    <td>{seperateName(item.srcip).part1}</td>
                    <td>{seperateName(item.srcip).part2}</td>
                    <td>{seperateName(item.dstip).part1}</td>
                    <td>{seperateName(item.dstip).part2}</td>
                    <td>{blankLine(item.tlsversion, item.keyexchange)}</td>
                    <td>{blankLine(item.tlsversion, item.authentication)}</td>
                    <td>{blankLine(item.tlsversion, item.bulkencryption)}</td>
                    <td>{blankLine(item.tlsversion, item.hash)}</td>
                    <td>{blankLine(item.tlsversion, item.certsignature)}</td>
                    <td>{blankLine(item.tlsversion, item.curvename)}</td>
                    <td>{blankLine(item.tlsversion, item.skesignature)}</td>
                    <td>{encryptionStatus(item.encryptionstatus)}</td>
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
