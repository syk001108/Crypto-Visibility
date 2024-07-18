// Topology.js

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
    const fetchLogData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/logdata');
        setLogData(response.data.reverse());
      } catch (error) {
        console.error('Error fetching log data:', error);
      }
    };

    fetchLogData();

    const socket = io('http://localhost:5000');
    socket.on('logDataChange', (changedDocument) => {
      console.log('Log data changed:', changedDocument);
      // 변경된 데이터를 받아와 state를 업데이트
      setLogData(prevLogData => [changedDocument, ...prevLogData]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Unique nodes와 links 생성 로직 등은 그대로 유지될 수 있습니다.

  const uniqueNodes = Array.from(new Set(logData.map(item => item.source).concat(logData.map(item => item.destination)))).map((item, index) => ({
    id: `Node${index + 1}`,
    name: item
  }));

  const links = logData.map(item => ({
    source: uniqueNodes.find(node => node.name === item.source).id,
    target: uniqueNodes.find(node => node.name === item.destination).id,
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

  const currentLogs = logData.slice(0, rowsPerPage);

  return (
    <div className="Topology">
      <Sidebar />
      <div className="Topology-content">
        <header className="Topology-header">
          <h3>Topology</h3>
        </header>
        <div className="Topology-body">
          <NetworkTopology nodes={uniqueNodes} links={links} />
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
                {currentLogs.map((item, index) => (
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
