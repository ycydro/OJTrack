import "../styles/Navs.css";
import Swal from "sweetalert2";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import { LogOut } from "lucide-react";
import Dropdown from "react-bootstrap/Dropdown";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import DropdownButton from "react-bootstrap/DropdownButton";
import exporTimeLogsToPDF from "../utils/exporTimeLogsToPDF";
import exportTimeLogsToExcel from "../utils/exportTimeLogsToExcel";
import { Download } from "lucide-react";

const Navs = ({ user, signOut, timeLogs }) => {
  const handleExport = (logs, type) => {
    if (logs?.length <= 0) {
      Swal.fire({
        title: "No Time Logs!",
        text: "No logs to export!",
        icon: "error",
        color: "#ffffff",
        background: "#1a1a1a",
        timer: 1250,
        customClass: {
          confirmButton: "primary-swal-button",
        },
      });
      return;
    }

    type === "pdf" ? exporTimeLogsToPDF(logs) : exportTimeLogsToExcel(logs);
  };
  return (
    <div className="container-fluid rounded-3 p-0 shadow mb-4 glassmorphism-container">
      <Card className="glassmorphism-navbar">
        <Card.Body className="p-0 navbar-content">
          <Navbar className="w-100 rounded-3">
            <Container className="px-3" id="nav-container">
              <Navbar.Brand className="navbar-brand d-flex gap-2">
                Welcome,{" "}
                <span className="gradient-underline">
                  {user?.user_metadata?.full_name.split(" ")[0]}!
                </span>
              </Navbar.Brand>
              <Navbar.Toggle />

              <Navbar.Collapse className="gap-2 justify-content-end navbar-end">
                <Dropdown align="end">
                  <Dropdown.Toggle variant="primary" id="export-dropdown">
                    <Download size={18} className="me-1" />
                    <span className="export-label">Export Time Logs</span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item
                      onClick={() => handleExport(timeLogs, "pdf")}
                    >
                      PDF
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => handleExport(timeLogs, "excel")}
                    >
                      Excel
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>

                <Navbar.Text>
                  <OverlayTrigger
                    placement="right"
                    overlay={<Tooltip id="button-tooltip-2">Sign Out</Tooltip>}
                  >
                    <Button className="gray-button" onClick={signOut}>
                      <LogOut color="#0a8efd" />
                    </Button>
                  </OverlayTrigger>
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
