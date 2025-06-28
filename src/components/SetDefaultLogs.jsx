import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { supabase } from "../lib/helper/supabaseClient";
import dayjs from "dayjs";
import { Form, Card, Button, Modal } from "react-bootstrap";
import "boxicons";
import "boxicons/css/boxicons.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import calculateTotalHours from "../utils/calculateTotalHours";
import "../styles/App.css";

const EditModal = ({ show, handleCloseSetDefaultLogs }) => {
  const [formData, setFormData] = useState({
    date: dayjs().format("YYYY-MM-DD"),
    time_in: "",
    time_out: "",
    lunch_break: false,
    specified_hours: 0,
  });

  const [showEditAdvanced, setShowEditAdvanced] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSetDefault = async () => {
    const formStr = JSON.stringify(formData);

    localStorage.setItem("defaultLog", formStr);

    Swal.fire({
      title: "Log set to default!",
      text: "Successfully set log as default!",
      icon: "success",
      timer: 2500,
    });
    handleCloseSetDefaultLogs();
  };

  return (
    <div>
      <Modal
        show={show}
        onHide={handleCloseSetDefaultLogs}
        aria-labelledby="contained-modal-title-vcenter"
        centered
        contentClassName="text-white"
      >
        <Modal.Header
          closeVariant="white"
          closeButton
          className="border-secondary"
          style={{
            backgroundColor: "#1a1a1a",
          }}
        >
          <Modal.Title className="text-white">Set Default Logs</Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            backgroundColor: "#1a1a1a",
          }}
        >
          <Card
            style={{
              backgroundColor: "#1a1a1a",
            }}
            className="border-0 rounded-3"
          >
            <Card.Body className="p-0 d-flex flex-column gap-5 justify-content-center align-items-center">
              <div
                className="d-flex flex-column justify-content-center align-items-center p-2"
                style={{ width: "90%" }}
              >
                <Form
                  className="w-100 text-white p-3 d-flex flex-column gap-3"
                  onSubmit={handleSetDefault}
                >
                  <Form.Group className="mb-1">
                    <Form.Label>Time In</Form.Label>
                    <Form.Control
                      type="time"
                      name="time_in"
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-1">
                    <Form.Label>Time Out</Form.Label>
                    <Form.Control
                      type="time"
                      name="time_out"
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      name="lunch_break"
                      id="lunch_break"
                      label="Lunch Break"
                      onChange={handleInputChange}
                    />
                  </Form.Group>

                  <div className="w-100">
                    <div
                      className="text-primary cursor-pointer mb-2 d-flex align-items-center gap-2"
                      onClick={() => setShowEditAdvanced(!showEditAdvanced)}
                      style={{ userSelect: "none", cursor: "pointer" }}
                    >
                      <span>
                        {showEditAdvanced ? "Hide options" : "More options..."}
                      </span>
                    </div>

                    <div
                      className={`advanced-options transition ${
                        showEditAdvanced ? "expanded" : ""
                      }`}
                    >
                      <Form.Group>
                        <Form.Label>Specify total hours worked:</Form.Label>
                        <Form.Control
                          type="number"
                          step="0.25"
                          placeholder="e.g. 7.5"
                          id="specified_hours"
                          name="specified_hours"
                          onChange={handleInputChange}
                        />
                        <Form.Text className="text-white-50">
                          Leave blank to calculate automatically
                        </Form.Text>
                      </Form.Group>
                    </div>
                  </div>
                  <Button onClick={handleSetDefault} className="w-100">
                    Set Default Time Log
                  </Button>
                </Form>
              </div>
            </Card.Body>
          </Card>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default EditModal;
