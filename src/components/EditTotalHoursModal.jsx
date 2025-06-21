import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { supabase } from "../lib/helper/supabaseClient";
import { Form, Card, Button, Modal } from "react-bootstrap";
import "boxicons";
import "boxicons/css/boxicons.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/App.css";
import InsertHoursRequired from "./InsertHoursRequired";

const EditTotalHoursModal = ({
  show,
  hoursRequired,
  user,
  handleCloseEditHours,
  fetchHoursRequired,
}) => {
  const [hours, setHours] = useState(hoursRequired || 0);

  useEffect(() => {
    if (hoursRequired) {
      setHours(hoursRequired);
    }
  }, [hoursRequired]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from("total_hours_required")
        .update({ hours_required: hours })
        .eq("user_id", user?.id)
        .select();

      if (error) throw error;
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.message,
        icon: "error",
        background: "#1a1a1a",
        color: "#ffffff",
      });
    } finally {
      handleCloseEditHours();
      fetchHoursRequired();
      setHours(0);
    }
  };
  return (
    <div>
      <Modal
        show={show}
        onHide={handleCloseEditHours}
        aria-labelledby="contained-modal-title-vcenter"
        centered
        contentClassName="bg-transparent text-white border-0 shadow-none"
      >
        <Modal.Body className="bg-transparent">
          <div className="d-flex justify-content-center my-4">
            <Card
              className="border-0 shadow-lg"
              style={{
                width: "100%",
                maxWidth: "500px",
                background: "linear-gradient(145deg, #2a2a2a, #1f1f1f)",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <Card.Header
                className="border-0 py-3 d-flex justify-content-between align-items-center"
                style={{
                  background: "linear-gradient(90deg, #3a3a3a, #2d2d2d)",
                  borderBottom: "1px solid #444",
                }}
              >
                <h5 className="mb-0 text-light">
                  <i className="bx bx-time-five me-2"></i>
                  Set Required Hours
                </h5>
                <Button
                  onClick={handleCloseEditHours}
                  className="btn btn-lg bg-transparent border-0 p-1 m-0 d-flex align-items-center"
                  style={{
                    width: "32px",
                    height: "32px",
                  }}
                >
                  <i className="bx bx-x fs-3 text-white align-middle"></i>
                </Button>
              </Card.Header>

              <Card.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label className="text-light mb-2">
                      Total Hours Required
                    </Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      className="py-3 bg-dark border-dark text-light"
                      style={{ borderRadius: "8px" }}
                    />
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 py-3 fw-bold border-0"
                    disabled={!hours}
                    style={{
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    Save
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default EditTotalHoursModal;
