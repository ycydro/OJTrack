import { useState } from "react";
import Swal from "sweetalert2";
import { supabase } from "../lib/helper/supabaseClient";
import { Form, Card, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const InsertHoursRequired = ({ fetchHoursRequired, user }) => {
  const [hours, setHours] = useState(0);

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
      fetchHoursRequired();
      setHours(0);
    }
  };

  return (
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
          className="border-0 py-3"
          style={{
            background: "linear-gradient(90deg, #3a3a3a, #2d2d2d)",
            borderBottom: "1px solid #444",
          }}
        >
          <h5 className="mb-0 text-light">
            <i className="bx bx-time-five me-2"></i>
            Set Required Hours
          </h5>
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
  );
};

export default InsertHoursRequired;
