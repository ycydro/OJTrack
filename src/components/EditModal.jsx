import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { supabase } from "../lib/helper/supabaseClient";
import dayjs from "dayjs";
import { Form, Card, Button, Modal } from "react-bootstrap";
import "boxicons";
import "boxicons/css/boxicons.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/App.css";
import "../styles/EditModal.css";

const EditModal = ({
  show,
  timeLogs,
  log,
  handleCloseModal,
  calculateTotalHours,
}) => {
  const [formData, setFormData] = useState({
    date: log?.date || "",
    time_in: log?.time_in || "",
    time_out: log?.time_out || "",
    lunch_break: log?.lunch_break || false,
  });

  const [logID, setLogID] = useState(log?.id || null);

  useEffect(() => {
    if (log) {
      setFormData({
        date: log.date || "",
        time_in: log.time_in || "",
        time_out: log.time_out || "",
        lunch_break: log.lunch_break || false,
      });

      setLogID(log.id);
    }
  }, [log]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleEdit = async (e) => {
    e.preventDefault();

    const originalLogData = {
      date: log?.date || "",
      time_in: log?.time_in || "",
      time_out: log?.time_out || "",
      lunch_break: log?.lunch_break || false,
    };

    const isUnchanged =
      formData.date === originalLogData.date &&
      formData.time_in === originalLogData.time_in &&
      formData.time_out === originalLogData.time_out &&
      formData.lunch_break === originalLogData.lunch_break;

    if (isUnchanged) {
      Swal.fire({
        title: "No Changes!",
        text: "No values have been changed.",
        color: "#ffffff",
        background: "#1a1a1a",
        icon: "info",
        customClass: {
          confirmButton: "primary-swal-button",
        },
      });
      return;
    }

    if (
      timeLogs.some((log) => formData.date === log.date && log.id !== logID)
    ) {
      Swal.fire({
        title: "Error!",
        text: `A time log for ${dayjs(formData.date).format(
          "MMM DD, YYYY"
        )} already exists.`,
        color: "#ffffff",
        background: "#1a1a1a",
        icon: "error",
        customClass: {
          confirmButton: "primary-swal-button",
        },
      });
      return;
    }

    const total_hours_today = calculateTotalHours(
      formData.time_in,
      formData.time_out,
      formData.lunch_break
    );

    if (total_hours_today <= 0) {
      Swal.fire({
        title: "Error!",
        text: `${total_hours_today} hours is an invalid time.`,
        icon: "error",
        color: "#ffffff",
        background: "#1a1a1a",
        timer: 2000,
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("time_logs")
        .update({
          date: formData.date,
          time_in: formData.time_in,
          time_out: formData.time_out,
          lunch_break: formData.lunch_break,
          total_hours_today: total_hours_today,
        })
        .eq("id", logID);

      if (error) throw error;

      Swal.fire({
        title: "Succss!",
        text: `Updated Time Log!`,
        icon: "success",
        color: "#ffffff",
        background: "#1a1a1a",
        timer: 2000,
        customClass: {
          confirmButton: "primary-swal-button",
        },
      });

      setLogID(null);
      handleCloseModal();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <Modal
        show={show}
        onHide={handleCloseModal}
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
          <Modal.Title className="text-white">
            Edit Time Log for {dayjs(log?.date).format("MMM DD, YYYY")}
          </Modal.Title>
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
                  onSubmit={handleEdit}
                >
                  <Form.Group className="mb-1">
                    <Form.Label>Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-1">
                    <Form.Label>Time In</Form.Label>
                    <Form.Control
                      type="time"
                      name="time_in"
                      value={formData.time_in}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-1">
                    <Form.Label>Time Out</Form.Label>
                    <Form.Control
                      type="time"
                      name="time_out"
                      value={formData.time_out}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Check
                      type="switch"
                      name="lunch_break"
                      id="lunch_break"
                      label="Lunch Break"
                      checked={formData.lunch_break}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                  <Button onClick={handleEdit} className="w-100">
                    Confirm Edit
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
