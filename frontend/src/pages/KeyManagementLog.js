import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import './CommonStyles.css';
import './CommonTable.css';
import Sidebar from '../components/Sidebar';

const KeyManagementLog = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [keyData, setKeyData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://10.10.0.151:5000/api/keydata');
        setKeyData(response.data.reverse());
        setTotalPages(Math.ceil(response.data.length / rowsPerPage));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    const socket = io('http://10.10.0.151:5000',{transports: ['websocket']});
    socket.on('keyDataChange', (change) => {
      console.log('Key data changed:', change);
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
  const currentLogs = keyData.slice(indexOfFirstLog, indexOfLastLog);

  return (
    <div className="CommonLayout">
      <Sidebar />
      <div className="CommonLayout-content">
        <header className="CommonLayout-header">
          <h3>Key Management Log</h3>
        </header>
        <div className="CommonLayout-body">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Client</th>
                  <th>Sans</th>
                  <th>TTL</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {currentLogs.map((item, index) => (
                  <tr key={index}>
                    <td>{item.date}</td>
                    <td>{item.client}</td>
                    <td>{item.sans}</td>
                    <td>{item.ttl}</td>
                    <td>{item.status}</td>
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

export default KeyManagementLog;
