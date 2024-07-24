import React, { useState } from "react";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import { FaChevronDown } from "react-icons/fa";
import 'bootstrap/dist/css/bootstrap.min.css';

const Topbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Navbar.Brand href="/">Crypto Visibility</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <NavDropdown
            title={<span> <FaChevronDown style={{ transition: 'transform 0.3s' }} className={showDropdown ? 'rotate' : ''} /> </span>}
            id="basic-nav-dropdown"
            show={showDropdown}
            onClick={handleDropdownToggle}
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
