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
  });

  const [logID, setLogID] = useState(log?.id || null);

  useEffect(() => {
    if (log) {
      setFormData({
        date: log.date || "",
        time_in: log.time_in || "",
        time_out: log.time_out || "",
      });

      setLogID(log.id);
    }
  }, [log]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleEdit = async (e) => {
    e.preventDefault();

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
      });
      return;
    }

    const total_hours_today = calculateTotalHours(
      formData.time_in,
      formData.time_out
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
        contentClassName="bg-dark text-white" // This sets the modal content background
      >
        <Modal.Header
          closeVariant="white"
          closeButton
          className="border-secondary bg-dark"
        >
          <Modal.Title className="text-white">
            Edit Time Log for {dayjs(log?.date).format("MMM DD, YYYY")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark">
          <Card bg="dark" className="border-0 rounded-3">
            <Card.Body className="p-0 d-flex flex-column gap-5 justify-content-center align-items-center">
              <div
                className="d-flex flex-column justify-content-center align-items-center p-2"
                style={{ width: "90%" }}
              >
                <Form className="w-100 text-white p-3" onSubmit={handleEdit}>
                  <Form.Group className="mb-1">
                    <Form.Label>Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="date"
                      value={formData?.date}
                      onChange={handleInputChange}
                      className="bg-dark text-white border-secondary"
                    />
                  </Form.Group>
                  <Form.Group className="mb-1">
                    <Form.Label>Time In</Form.Label>
                    <Form.Control
                      type="time"
                      name="time_in"
                      value={formData?.time_in}
                      onChange={handleInputChange}
                      required
                      className="bg-dark text-white border-secondary"
                    />
                  </Form.Group>
                  <Form.Group className="mb-1">
                    <Form.Label>Time Out</Form.Label>
                    <Form.Control
                      type="time"
                      name="time_out"
                      value={formData?.time_out}
                      onChange={handleInputChange}
                      required
                      className="bg-dark text-white border-secondary"
                    />
                  </Form.Group>
                  <Button
                    onClick={handleEdit}
                    className="w-100 h-auto mt-5"
                    type="submit"
                  >
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
