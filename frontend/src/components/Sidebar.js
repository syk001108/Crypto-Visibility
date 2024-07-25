import React, { useState } from "react";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import { FaChevronRight } from "react-icons/fa";
import { useLocation, NavLink } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Sidebar.css';

const Topbar = () => {
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  // 현재 경로에 따라 메뉴 제목을 결정
  const getMenuTitle = () => {
    switch (location.pathname) {
      case '/alllog':
        return 'SSL/TLS Session';
      case '/keymanagementlog':
        return 'Key Management';
      case '/':
        return 'Overall';
      default:
        return 'Menu'; // 기본 메뉴 제목
    }
  };

  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <Navbar className="custom-navbar" expand="lg">
      <Navbar.Brand href="/">Crypto Visibility</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <NavDropdown
            title={
              <span className="dropdown-title">
                <FaChevronRight
                  className={showDropdown ? 'rotate' : ''}
                />
                <span className="dropdown-text">{getMenuTitle()}</span>
              </span>
            }
            id="basic-nav-dropdown"
            show={showDropdown}
            onClick={handleDropdownToggle}
            className="custom-dropdown"
          >
            <NavDropdown.Item href="/">Overall</NavDropdown.Item>
            <NavDropdown.Item href="/alllog">SSL/TLS Session</NavDropdown.Item>
            <NavDropdown.Item href="/keymanagementlog">Key Management</NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Topbar;
