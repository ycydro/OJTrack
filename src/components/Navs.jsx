import { useState } from "react";
import "../styles/Navs.css";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Dropdown from "react-bootstrap/Dropdown";
import Card from "react-bootstrap/Card";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import { LogOut } from "lucide-react";
import ShinyText from "./ShinyText";

const Navs = ({ user, signOut }) => {
  return (
    <div className="container-fluid rounded-3 p-0 shadow mb-4 glassmorphism-container">
      <Card className="glassmorphism-navbar">
        <Card.Body className="p-0 navbar-content">
          <Navbar className="w-100 rounded-3">
            <Container className="px-3">
              <Navbar.Brand className="navbar-brand d-flex gap-2">
                Welcome,{" "}
                <span className="gradient-underline">
                  {user?.user_metadata?.full_name.split(" ")[0]}!
                </span>
              </Navbar.Brand>
              <Navbar.Toggle />
              <Navbar.Collapse className="justify-content-end navbar-end">
                <Navbar.Text>
                  <Button className="sign-out-button" onClick={signOut}>
                    <LogOut color="#0a8efd" />
                  </Button>
                </Navbar.Text>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Navs;
