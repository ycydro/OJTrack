import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { supabase } from "../lib/helper/supabaseClient";
import dayjs from "dayjs";
import { Form, Card, Button, Spinner } from "react-bootstrap";
import "boxicons";
import "boxicons/css/boxicons.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/App.css";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import InsertHoursRequired from "./InsertHoursRequired";
import EditModal from "./EditModal";

const Dashboard = ({ user, setUser }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    time_in: "",
    time_out: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isHoursRequiredLoading, setIsHoursRequiredLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [logToEdit, setLogToEdit] = useState(null);
  const [timeLogs, setTimeLogs] = useState([]);
  const [cumulativeHours, setCumulativeHours] = useState(0);
  const [hoursRequired, setHoursRequired] = useState(486);
  const [progressPercentage, setProgressPercentage] = useState(0);

  const fetchHoursRequired = async () => {
    setIsHoursRequiredLoading(true);
    try {
      const { data, error } = await supabase
        .from("total_hours_required")
        .select()
        .eq("user_id", user?.id);

      if (error) throw error;

      if (data.length === 0) {
        // No row exists, insert a default one
        const { error: insertError } = await supabase
          .from("total_hours_required")
          .insert([{ user_id: user?.id, hours_required: 0 }]);

        if (insertError) throw insertError;

        setHoursRequired(0);
        console.log("Inserted default required hours (0)");
      } else {
        setHoursRequired(data[0].hours_required);
        console.log(data[0].hours_required, "this is the required hours");
      }
    } catch (error) {
      console.error("Error fetching or inserting time log:", error.message);
      alert("Error fetching or inserting time log: " + error.message);
    } finally {
      setIsHoursRequiredLoading(false);
    }
  };

  useEffect(() => {
    fetchHoursRequired();
  }, []);

  const fetchTimeLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("time_logs")
        .select()
        .eq("user_id", user?.id)
        .order("date", { ascending: false });

      if (error) throw error;

      setTimeLogs(data);
    } catch (error) {
      console.error("Error fetching time log:", error.message);
      alert("Error fetching time log: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;
      setUser(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const formatTimeToAMPM = (timeString) => {
    const [hours, minutes, seconds] = timeString.split(":");
    const date = new Date();
    date.setHours(+hours, +minutes, +seconds);

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const calculateTotalHours = (timeIn, timeOut) => {
    if (!timeIn || !timeOut) return 0;

    const [inHours, inMinutes] = timeIn.split(":").map(Number);
    const [outHours, outMinutes] = timeOut.split(":").map(Number);

    const totalMinutes =
      outHours * 60 + outMinutes - (inHours * 60 + inMinutes);
    return (totalMinutes / 60).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (timeLogs.some((log) => log.date === formData.date)) {
        Swal.fire({
          title: "Error!",
          text: `A time log for ${dayjs(formData.date).format(
            "MMM DD, YYYY"
          )} already exists.`,
          icon: "error",
          color: "#ffffff",
          background: "#1a1a1a",
        });
        return;
      }

      const total_hours_today = calculateTotalHours(
        formData.time_in,
        formData.time_out
      );

      if (total_hours_today <= 0) {
        Swal.fire({
          title: "Oops!",
          text: `You can't log zero or negative hours.`,
          icon: "warning",
          color: "#ffffff",
          background: "#1a1a1a",
          timer: 2000,
        });
        return;
      }

      const { error } = await supabase
        .from("time_logs")
        .insert({
          user_id: user.id,
          date: formData.date,
          time_in: formData.time_in,
          time_out: formData.time_out,
          total_hours_today: total_hours_today,
        })
        .select();

      if (error) throw error;

      Swal.fire({
        title: "Success!",
        text: "Successfuly logged time!",
        icon: "success",
        color: "#ffffff",
        background: "#1a1a1a",
        timer: 2000,
      });

      setFormData({
        date: new Date().toISOString().split("T")[0],
        time_in: "",
        time_out: "",
      });
    } catch (error) {
      console.error("Error adding time log:", error.message);
      alert("Error adding time log: " + error.message);
    } finally {
      fetchTimeLogs();
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        color: "#ffffff",
        background: "#1a1a1a",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      });

      if (!result.isConfirmed) return;

      const { error } = await supabase.from("time_logs").delete().eq("id", id);

      if (error) throw error;

      Swal.fire({
        title: "Success!",
        text: "Successfuly deleted time log.",
        icon: "success",
        color: "#ffffff",
        background: "#1a1a1a",
        timer: 2000,
      });

      fetchTimeLogs();
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error!",
        text: error,
        icon: "Error",
        color: "#ffffff",
        background: "#1a1a1a",
        timer: 2000,
      });
    }
  };

  const handleShowModal = (log) => {
    setLogToEdit(log);
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setLogToEdit(null);
    fetchTimeLogs();
  };

  useEffect(() => {
    fetchTimeLogs();
  }, []);

  useEffect(() => {
    const getCumulativeHours = timeLogs.reduce((a, log) => {
      return a + (log.total_hours_today || 0);
    }, 0);

    console.log(timeLogs, `This is time logs array`);
    console.log("Total cumulative hours:", getCumulativeHours);
    setCumulativeHours(getCumulativeHours.toFixed(2));
  }, [timeLogs]);

  useEffect(() => {
    const calculateProgressPercentage = () => {
      return ((cumulativeHours / hoursRequired) * 100).toFixed(2);
    };

    setProgressPercentage(calculateProgressPercentage());
  }, [cumulativeHours, hoursRequired]);

  return (
    <div
      className="container-fluid w-100 h-auto bg-black bg-gradient text-white d-flex flex-column align-items-center justify-content-start"
      style={{ minHeight: "100vh" }}
    >
      {hoursRequired <= 0 ? (
        <div className="mt-5 pb-1 container-fluid w-75 h-auto">
          <InsertHoursRequired
            user={user}
            fetchHoursRequired={fetchHoursRequired}
          />
        </div>
      ) : (
        <div className="mt-3 pb-1 container-fluid w-75 w-md-100 px-md-3 h-auto">
          <header className="row py-3">
            <div className="col-8">
              <p className="m-0">
                Welcome, {user?.user_metadata?.full_name.split(" ")[0]}!
              </p>
            </div>
            <div className="col p-0 d-flex justify-content-end">
              <button
                onClick={signOut}
                className="underline-hover h-100 bg-transparent border-0 text-white text-end"
              >
                Sign Out
              </button>
            </div>
          </header>

          <section className="container-fluid px-0">
            <div className="row align-items-center justify-content-center gap-4">
              <div
                className="col-auto"
                style={{
                  maxWidth: "250px",
                  width: "100%",
                  padding: "0 15px",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    maxWidth: "200px",
                    margin: "0 auto",
                  }}
                >
                  <CircularProgressbar
                    value={progressPercentage}
                    text={`${progressPercentage}%`}
                    styles={buildStyles({
                      textColor: "whitesmoke",
                      pathColor: "#0D6EFD",
                      trailColor: "whitesmoke",
                      text: {
                        fontSize: "24px",
                        fontWeight: "bold",
                        fill: "#fff",
                      },
                      path: {
                        stroke: "#3e98c7",
                      },
                    })}
                  />
                </div>
              </div>

              <div className="col-auto d-flex justify-content-center align-items-center px-3">
                <span
                  className="h1 m-0"
                  style={{ fontSize: "clamp(1rem, 4vw, 2.5rem)" }}
                >
                  {parseFloat(cumulativeHours)} out of{" "}
                  {isHoursRequiredLoading ? <Spinner /> : hoursRequired} hours
                </span>
              </div>
            </div>
          </section>

          <main className="row gap-4 my-4 flex-md-row flex-column">
            <div className="col container-fluid border border-light-subtle rounded-3 p-0 shadow">
              <Card bg="dark" className="border-0 rounded-3">
                <Card.Body
                  className="p-0 d-flex flex-column gap-5 justify-content-center align-items-center"
                  style={{ minHeight: "28rem" }}
                >
                  <div
                    className="d-flex flex-column justify-content-center align-items-center p-4"
                    style={{
                      width: "90%",
                    }}
                  >
                    <Form
                      className="w-100 text-white p-3"
                      onSubmit={handleSubmit}
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
                      <Button
                        className="w-100 h-auto mt-5"
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Adding..." : "Add Time Log"}
                      </Button>
                    </Form>
                  </div>
                </Card.Body>
              </Card>
            </div>

            <div className="col container-fluid border border-light-subtle rounded-3 p-0 shadow mt-3 mt-md-0">
              <Card
                bg="dark"
                className="border-0 rounded-3"
                style={{
                  minHeight: "28rem",
                  maxHeight: "28rem",
                }}
              >
                <Card.Body
                  className={`px-0 py-3 d-flex flex-column gap-2 align-items-center scrollable-contents ${
                    isLoading || timeLogs.length <= 0
                      ? "justify-content-center"
                      : "justify-content-start"
                  }`}
                  style={{
                    minHeight: "25rem",
                    overflowY: "auto",
                  }}
                >
                  {isLoading ? (
                    <div className="w-100 h-100 d-flex justify-content-center my-5">
                      <Spinner
                        animation="border"
                        variant="primary"
                        style={{ width: "4rem", height: "4rem" }}
                      />
                    </div>
                  ) : timeLogs.length <= 0 ? (
                    <div>
                      <span className="text-center text-white">
                        No logs yet.
                      </span>
                    </div>
                  ) : (
                    timeLogs?.map((log) => (
                      <Card
                        key={log.id}
                        className="position-relative my-2 shadow-lg border-0"
                        style={{
                          width: "85%",
                        }}
                      >
                        <Card.Header
                          as="h6"
                          className="text-white bg-primary"
                          style={{
                            borderTopLeftRadius: "0.375rem",
                            borderTopRightRadius: "0.375rem",
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-center p-0 m-0">
                            <span>{dayjs(log.date).format("MMM D, YYYY")}</span>
                            <div className="d-flex gap-2">
                              <Button
                                type="button"
                                onClick={() => handleShowModal(log)}
                                className="btn btn-sm btn-secondary rounded-circle p-1 d-flex align-items-center justify-content-center w-100 h-100"
                              >
                                <i className="bx bx-edit fs-6 lh-1"></i>
                              </Button>
                              <Button
                                type="button"
                                onClick={() => handleDelete(log.id)}
                                className="btn btn-sm btn-danger rounded-circle p-1 d-flex align-items-center justify-content-center w-100 h-100"
                              >
                                <i className="bx bx-trash fs-6 lh-1"></i>
                              </Button>
                            </div>
                          </div>
                        </Card.Header>
                        <Card.Body className="p-1 bg-transparent">
                          <div className="row">
                            <div className="col d-flex flex-column gap-1 text-muted">
                              <div className="m-0 px-2 d-flex justify-content-between">
                                <Card.Text>
                                  Time In: {formatTimeToAMPM(log.time_in)}
                                </Card.Text>
                              </div>
                              <div className="m-0 px-2 d-flex align-items-center">
                                <div className="me-auto">
                                  <Card.Text>
                                    Time Out: {formatTimeToAMPM(log.time_out)}
                                  </Card.Text>
                                </div>
                                <div>
                                  <Card.Text className="text-success fw-bold text-nowrap d-flex justify-content-center align-items-center">
                                    <i className="bx bx-plus fs-6 lh-1"></i>
                                    {log.total_hours_today}{" "}
                                    {log.total_hours_today > 1
                                      ? "Hours"
                                      : "Hour"}
                                  </Card.Text>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    ))
                  )}
                </Card.Body>
              </Card>
            </div>
          </main>
        </div>
      )}

      <EditModal
        show={showEditModal}
        log={logToEdit}
        timeLogs={timeLogs}
        calculateTotalHours={calculateTotalHours}
        handleCloseModal={handleCloseModal}
      />
    </div>
  );
};

export default Dashboard;
