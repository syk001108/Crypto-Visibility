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

  const indexOfLastLog = currentPage * rowsPerPage;
  const indexOfFirstLog = indexOfLastLog - rowsPerPage;
  const currentLogs = logData.slice(indexOfFirstLog, indexOfLastLog);

  return (
    <div className="CommonLayout">
      <Sidebar />
      <div className="CommonLayout-content">
        <header className="CommonLayout-header">
          <h3>TLS Communication Log</h3>
        </header>
        <div className="CommonLayout-body">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Source</th>
                  <th>Destination</th>
                  <th>Encryption Status</th>
                  <th>TLS Version</th>
                  <th>Key Exchange</th>
                  <th>Authentication</th>
                  <th>Bulk Encryption</th>
                  <th>Hash</th>
                  <th>Cert Signature Algorithm</th>
                  <th>Elliptic Curve</th>
                  <th>SKE Signature Algorithm</th>
                </tr>
              </thead>
              <tbody>
                {currentLogs.map((item, index) => (
                  <tr key={index}>
                    <td>{item.timestamp}</td>
                    <td>{item.srcip}</td>
                    <td>{item.dstip}</td>
                    <td>{item.encryptionstatus}</td>
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
