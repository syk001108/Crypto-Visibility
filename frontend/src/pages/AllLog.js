import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import './CommonStyles.css';
import './CommonTable.css';
import Sidebar from '../components/Sidebar';

const AllLog = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [logData, setLogData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://10.10.0.151:5000/api/logdata');
        setLogData(response.data.reverse());
        setTotalPages(Math.ceil(response.data.length / rowsPerPage));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    const socket = io('http://10.10.0.151:5000',{transports: ['websocket']});
    socket.on('logDataChange', (change) => {
      console.log('Log data changed:', change);
      fetchData();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleClick = (page) => {
    setCurrentPage(page);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPageButtons = 5;
    let startPage = Math.max(currentPage - 2, 1);
    let endPage = Math.min(currentPage + 2, totalPages);

    if (endPage - startPage < maxPageButtons - 1) {
      startPage = Math.max(endPage - maxPageButtons + 1, 1);
    }

    if (currentPage < 4) {
      startPage = 1;
      endPage = Math.min(5, totalPages);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handleClick(i)}
          className={i === currentPage ? 'active' : ''}
          disabled={i === currentPage}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

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

  const indexOfLastLog = currentPage * rowsPerPage;
  const indexOfFirstLog = indexOfLastLog - rowsPerPage;
  const currentLogs = logData.slice(indexOfFirstLog, indexOfLastLog);

  return (
    <div className="CommonLayout">
      <div className="CommonLayout-content">
      <Sidebar />
        <div className="CommonLayout-body">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
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
              </thead>
              <tbody>
                {currentLogs.map((item, index) => (
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
              </tbody>
            </table>
            <div className="pagination">
              {renderPageNumbers()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllLog;
