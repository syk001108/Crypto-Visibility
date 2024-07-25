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

    const socket = io('http://10.10.0.151:5000', { transports: ['websocket'] });
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

  const formatUTCDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'UTC' };
    return new Intl.DateTimeFormat('en-GB', options).format(date).replace(',', '');
  };

  const parseTTLToSeconds = (ttlString) => {
    const ttlParts = ttlString.match(/(\d+)([yMdHms])/g) || [];
    let totalSeconds = 0;
    let currentDate = new Date();

    // 월별 일수 배열
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    ttlParts.forEach(part => {
      const value = parseInt(part, 10);
      const unit = part.charAt(part.length - 1);

      switch (unit) {
        case 'y':
          // 연도 계산 (윤년 고려)
          for (let i = 0; i < value; i++) {
            currentDate.setFullYear(currentDate.getFullYear() + 1);
            if ((currentDate.getFullYear() % 4 === 0 && currentDate.getFullYear() % 100 !== 0) || (currentDate.getFullYear() % 400 === 0)) {
              totalSeconds += 366 * 24 * 60 * 60; // 윤년
            } else {
              totalSeconds += 365 * 24 * 60 * 60; // 평년
            }
          }
          break;
        case 'M':
          // 월 계산 (각 월의 일수 고려)
          for (let i = 0; i < value; i++) {
            const month = currentDate.getMonth();
            currentDate.setMonth(month + 1);
            const days = daysInMonth[currentDate.getMonth() - 1];
            if (currentDate.getMonth() === 1 && ((currentDate.getFullYear() % 4 === 0 && currentDate.getFullYear() % 100 !== 0) || (currentDate.getFullYear() % 400 === 0))) {
              // 윤년 2월 추가 일수
              totalSeconds += (days + 1) * 24 * 60 * 60;
            } else {
              totalSeconds += days * 24 * 60 * 60;
            }
          }
          break;
        case 'd':
          totalSeconds += value * 24 * 60 * 60; // 일
          break;
        case 'H':
          totalSeconds += value * 60 * 60; // 시간
          break;
        case 'm':
          totalSeconds += value * 60; // 분
          break;
        case 's':
          totalSeconds += value; // 초
          break;
        default:
          break;
      }
    });

    return totalSeconds;
  };

  const calculateRemainingTime = (dateString, ttl) => {
    const now = new Date();
    const parsedDate = new Date(dateString);
    const ttlSeconds = parseTTLToSeconds(ttl);

    const expirationDate = new Date(parsedDate.getTime() + ttlSeconds * 1000);
    const remainingTimeMs = now - expirationDate;

    if (remainingTimeMs <= 0) {
      return 'Expired';
    }

    const hours = Math.floor(remainingTimeMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingTimeMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingTimeMs % (1000 * 60)) / 1000);

    let result = '';
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m `;
    if (seconds > 0 || result === '') result += `${seconds}s`;

    return result.trim();
  };

  const blankLine = (String) => {
    if (String === '') {
      return '-';
    }
    return String;
  }

  const indexOfLastLog = currentPage * rowsPerPage;
  const indexOfFirstLog = indexOfLastLog - rowsPerPage;
  const currentLogs = keyData.slice(indexOfFirstLog, indexOfLastLog);

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
                  <th>Client</th>
                  <th>Status</th>
                  <th>TTL</th>
                  <th>Remaining Time</th>
                  <th>Sans</th>
                </tr>
              </thead>
              <tbody>
                {currentLogs.map((item, index) => (
                  <tr key={index}>
                    <td>{formatUTCDate(item.date)}</td>
                    <td>{item.client}</td>
                    <td>{item.status}</td>
                    <td>{blankLine(item.ttl)}</td>
                    <td>{calculateRemainingTime(item.date, item.ttl)}</td>
                    <td>{item.sans}</td>
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
