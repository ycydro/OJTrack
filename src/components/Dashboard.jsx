import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { supabase } from "../lib/helper/supabaseClient";
import dayjs from "dayjs";
import { Form, Card, Button, Spinner, Nav } from "react-bootstrap";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import "boxicons";
import "boxicons/css/boxicons.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Navs.css";
import "../styles/App.css";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import InsertHoursRequired from "./InsertHoursRequired";
import Navs from "./Navs";
import EditModal from "./EditModal";
import EditTotalHoursModal from "./EditTotalHoursModal";
import SetDefaultLogs from "./SetDefaultLogs";
import ShinyText from "./ShinyText";
import formatTimeToAMPM from "../utils/formatTimeToAMPM";
import calculateTotalHours from "../utils/calculateTotalHours";

const Dashboard = ({ user, setUser }) => {
  const [formData, setFormData] = useState({
    date: dayjs().format("YYYY-MM-DD"),
    time_in: "",
    time_out: "",
    lunch_break: false,
    specified_hours: 0,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isHoursRequiredLoading, setIsHoursRequiredLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditTotalHoursModal, setShowEditTotalHoursModal] = useState(false);
  const [showSetDefaultLogs, setShowSetDefaultLogs] = useState(false);
  const [logToEdit, setLogToEdit] = useState(null);
  const [timeLogs, setTimeLogs] = useState([]);
  const [cumulativeHours, setCumulativeHours] = useState(0);
  const [daysWorked, setDaysWorked] = useState(0);
  const [daysRequired, setDaysRequired] = useState(0);

  const [dayHours, setDayHours] = useState(0);
  const [hoursRequired, setHoursRequired] = useState(486);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [defaultLog, setDefaultLog] = useState({});

  const fetchStoredLogs = async () => {
    const storedLog = localStorage.getItem("defaultLog");

    setDefaultLog(JSON.parse(storedLog) || {});
  };

  const fetchHoursRequired = async () => {
    setIsHoursRequiredLoading(true);
    try {
      const { data, error } = await supabase
        .from("total_hours_required")
        .select()
        .eq("user_id", user?.id);

      if (error) throw error;

      console.log(data.length, "data length");
      console.log(data, "this is data");

      if (data.length === 0) {
        // No row exists, insert a default one
        const { error: insertError } = await supabase
          .from("total_hours_required")
          .insert([{ user_id: user?.id, hours_required: 0, day_hours: 0 }]);

        if (insertError) throw insertError;

        setHoursRequired(0);
      } else if (data[0].hours_required === null) {
        const { error: insertError } = await supabase
          .from("total_hours_required")
          .insert([{ user_id: user?.id, hours_required: 0 }]);

        if (insertError) throw insertError;

        setHoursRequired(0);
        setDayHours(0);
      } else if (data[0].day_hours <= 0) {
        const { error: insertError } = await supabase
          .from("total_hours_required")
          .insert([{ user_id: user?.id, day_hours: 0 }]);

        if (insertError) throw insertError;

        setHoursRequired(0);
        setDayHours(0);
      } else {
        setHoursRequired(data[0].hours_required);
        setDayHours(data[0].day_hours);
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
      const result = await Swal.fire({
        title: "Sign Out",
        text: "Are you sure you want to sign out?",
        icon: "warning",
        color: "#ffffff",
        background: "#1a1a1a",
        showCancelButton: true,
        confirmButtonText: "Yes, sign out!",
        cancelButtonText: "Cancel",
        customClass: {
          confirmButton: "primary-swal-button",
        },
      });

      if (!result.isConfirmed) return;
      const { error } = await supabase.auth.signOut();

      if (error) throw error;
      setUser(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
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
          customClass: {
            confirmButton: "primary-swal-button",
          },
        });
        return;
      }

      // if walang inispecify si user na hours, cacalculate yung time in, time out, saka lunch break (1 hour)
      const total_hours_today = formData.specified_hours
        ? formData.specified_hours
        : calculateTotalHours(
            formData.time_in,
            formData.time_out,
            formData.lunch_break
          );

      if (total_hours_today <= 0) {
        Swal.fire({
          title: "Oops!",
          text: `You can't log zero or negative hours.`,
          icon: "warning",
          color: "#ffffff",
          background: "#1a1a1a",
          timer: 2000,
          customClass: {
            confirmButton: "primary-swal-button",
          },
        });
        return;
      }

      const { error } = await supabase.from("time_logs").insert({
        user_id: user.id,
        date: formData.date,
        time_in: formData.time_in,
        time_out: formData.time_out,
        lunch_break: formData.lunch_break,
        total_hours_today: total_hours_today,
        specified_hours: formData.specified_hours,
      });

      if (error) throw error;

      Swal.fire({
        title: "Success!",
        text: "Successfully  logged time!",
        icon: "success",
        color: "#ffffff",
        background: "#1a1a1a",
        timer: 2000,
        customClass: {
          confirmButton: "primary-swal-button",
        },
      });

      setFormData({
        // automatically increment formDate by 1 day to avoid inserting log with same date
        date: dayjs(formData?.date).add(1, "day").format("YYYY-MM-DD"),
        time_in: "",
        time_out: "",
        lunch_break: false,
        specified_hours: 0,
      });

      // reset specified hours input value to empty string but its really 0
      showAdvanced && (document.getElementById("specified_hours").value = "");

      fetchTimeLogs();
    } catch (error) {
      console.error("Error adding time log:", error.message);
      alert("Error adding time log: " + error.message);
    } finally {
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
        customClass: {
          confirmButton: "primary-swal-button",
        },
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
        customClass: {
          confirmButton: "primary-swal-button",
        },
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
        customClass: {
          confirmButton: "primary-swal-button",
        },
      });
    }
  };

  const handleDeleteAll = async () => {
    try {
      if (timeLogs.length <= 0) {
        Swal.fire({
          title: "No Time Logs!",
          text: "No logs to delete!",
          icon: "error",
          color: "#ffffff",
          background: "#1a1a1a",
          timer: 2000,
          customClass: {
            confirmButton: "primary-swal-button",
          },
        });
        return;
      }

      const result = await Swal.fire({
        title: "Delete all time logs?",
        text: "You won't be able to revert this!",
        icon: "warning",
        color: "#ffffff",
        background: "#1a1a1a",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it all!",
        cancelButtonText: "Cancel",
        customClass: {
          confirmButton: "primary-swal-button",
        },
      });

      if (!result.isConfirmed) return;

      const { error } = await supabase
        .from("time_logs")
        .delete()
        .eq("user_id", user?.id);

      if (error) throw error;

      Swal.fire({
        title: "Success!",
        text: "Successfuly deleted time log.",
        icon: "success",
        color: "#ffffff",
        background: "#1a1a1a",
        timer: 2000,
        customClass: {
          confirmButton: "primary-swal-button",
        },
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
        customClass: {
          confirmButton: "primary-swal-button",
        },
      });
    }
  };

  const handleShowEditHours = () => {
    setShowEditTotalHoursModal(true);
  };

  const handleCloseEditHours = () => {
    setShowEditTotalHoursModal(false);
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

  const hanldeShowSetDefaultLogs = () => {
    setShowSetDefaultLogs(true);
  };

  const handleCloseSetDefaultLogs = () => {
    setShowSetDefaultLogs(false);
    fetchTimeLogs();
  };

  const handleDefaultLogs = () => {
    console.log(defaultLog);
    if (Object.keys(defaultLog).length > 0) {
      setFormData({
        date: formData.date,
        time_in: defaultLog.time_in,
        time_out: defaultLog.time_out,
        lunch_break: defaultLog.lunch_break,
        specified_hours: defaultLog.specified_hours,
      });
    }
  };

  useEffect(() => {
    fetchTimeLogs();
    fetchStoredLogs();
  }, []);

  useEffect(() => {
    const getCumulativeHours = timeLogs.reduce((a, log) => {
      return a + (log.total_hours_today || 0);
    }, 0);

    setCumulativeHours(getCumulativeHours.toFixed(2));
    // console.log(timeLogs);
  }, [timeLogs]);

  useEffect(() => {
    setDaysWorked(Math.ceil(cumulativeHours / dayHours));
  }, [cumulativeHours, dayHours]);

  useEffect(() => {
    setDaysRequired(Math.ceil(hoursRequired / dayHours));
  }, [hoursRequired, dayHours]);

  useEffect(() => {
    const calculateProgressPercentage = () => {
      return ((cumulativeHours / hoursRequired) * 100).toFixed(2);
    };

    setProgressPercentage(calculateProgressPercentage());
  }, [cumulativeHours, hoursRequired]);

  useEffect(() => {});

  useEffect(() => {
    console.log(formData);
  }, [formData]);

  useEffect(() => {
    fetchStoredLogs();
  }, [showSetDefaultLogs]);

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
          <header className="mb-3 postion-sticky">
            <Navs user={user} signOut={signOut} timeLogs={timeLogs} />
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

              <div className="col-auto d-flex flex-column h-100 justify-content-center gap-1 align-items-center px-3">
                {isHoursRequiredLoading ? (
                  <Spinner
                    style={{
                      fontSize: "8px",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      color: "#949494",
                    }}
                  >
                    Total days worked: {daysWorked} / {daysRequired} days
                  </div>
                )}
                <div
                  className="h1 m-0"
                  style={{ fontSize: "clamp(1rem, 4vw, 2.5rem)" }}
                >
                  {parseFloat(cumulativeHours)} out of{" "}
                  {isHoursRequiredLoading ? (
                    <Spinner />
                  ) : (
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip id="button-tooltip-2">
                          Change Required Hours
                        </Tooltip>
                      }
                    >
                      <button
                        className="p-0 border-0 bg-transparent btn-text text-white h1"
                        onClick={handleShowEditHours}
                        style={{
                          fontFamily: "inherit",
                          fontSize: "inherit",
                        }}
                      >
                        <ShinyText
                          colors={[
                            "#40ffaa",
                            "#4079ff",
                            "#40ffaa",
                            "#4079ff",
                            "#40ffaa",
                          ]}
                          animationSpeed={5}
                          showBorder={false}
                          className="custom-class"
                        >
                          {hoursRequired}
                        </ShinyText>
                      </button>
                    </OverlayTrigger>
                  )}{" "}
                  hours
                </div>
              </div>
            </div>
          </section>

          <main className="row gap-4 my-4 flex-md-row flex-column">
            <div className="col container-fluid border border-light-subtle rounded-3 p-0 shadow">
              <Card className="border-0 rounded-3 transparent-bg">
                <Card.Body
                  className="p-0 d-flex flex-column gap-5 justify-content-center align-items-center"
                  style={{ minHeight: "28rem" }}
                >
                  <div
                    className="d-flex flex-column justify-content-center align-items-center p-4"
                    style={{ width: "90%" }}
                  >
                    <Form
                      className="w-100 text-white p-3 d-flex flex-column gap-3"
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
                      <Form.Group className="mb-1">
                        <OverlayTrigger
                          placement="left"
                          overlay={
                            <Tooltip id="button-tooltip-2">
                              Reduce an hour from total calculated hours
                            </Tooltip>
                          }
                        >
                          <Form.Check
                            type="switch"
                            name="lunch_break"
                            id="lunch_break"
                            label="Lunch Break"
                            checked={formData.lunch_break}
                            onChange={handleInputChange}
                          />
                        </OverlayTrigger>
                      </Form.Group>

                      <div className="w-100">
                        <div
                          className="text-primary mb-2 d-flex align-items-center gap-2"
                          onClick={() => {
                            const wasClosed = !showAdvanced;
                            setShowAdvanced(!showAdvanced);

                            // const hasValue =
                            //   formData.lunch_break || formData.specified_hours;

                            // if (hasValue) {
                            //   setFormData((prevFormData) => ({
                            //     ...prevFormData,
                            //     lunch_break: false,
                            //     specified_hours: 0,
                            //   }));
                            // }

                            // document.getElementById("specified_hours").value =
                            //   "";

                            setTimeout(() => {
                              if (wasClosed) {
                                window.scrollTo({
                                  top: 325,
                                  behavior: "smooth",
                                });
                              } else {
                                window.scrollTo({
                                  top: 65,
                                  behavior: "smooth",
                                });
                              }
                            }, 275);
                          }}
                          style={{ userSelect: "none", cursor: "pointer" }}
                        >
                          <span>
                            {showAdvanced ? "Hide options" : "More options..."}
                          </span>
                        </div>

                        <div
                          className={`advanced-options transition ${
                            showAdvanced ? "expanded" : ""
                          }`}
                        >
                          <Form.Group className="d-flex flex-column gap-1">
                            <Form.Label style={{ whiteSpace: "nowrap" }}>
                              Specify total hours worked:
                            </Form.Label>
                            <Form.Control
                              type="number"
                              min={0}
                              placeholder="e.g. 8"
                              value={formData.specified_hours}
                              id="specified_hours"
                              name="specified_hours"
                              onChange={handleInputChange}
                            />
                            <Form.Text className="text-white-50">
                              Leave blank to calculate hours automatically
                            </Form.Text>
                          </Form.Group>
                          <div className="mt-3">
                            <div className="row g-2">
                              <div className="col-12 col-md-6">
                                <Button
                                  variant="outline-light"
                                  size="sm"
                                  className="w-100 d-flex align-items-center justify-content-center gap-2 py-2"
                                  onClick={handleDefaultLogs}
                                  disabled={isSubmitting}
                                >
                                  <i className="bx bx-time fs-6"></i>
                                  <span>Autofill Time Log</span>
                                </Button>
                              </div>
                              <div className="col-12 col-md-6">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  className="w-100 d-flex align-items-center justify-content-center gap-2 py-2"
                                  onClick={hanldeShowSetDefaultLogs}
                                  disabled={isSubmitting}
                                >
                                  <i className="bx bx-cog fs-6"></i>
                                  <span>Configure Autofill</span>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button
                        className="w-100 h-auto mt-2"
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

            <div className="col container-fluid border border-light-subtle rounded-3 p-0 shadow mt-3 mt-md-0 position-relative">
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id="button-tooltip-2">Delete all Time Logs</Tooltip>
                }
              >
                <Button
                  onClick={handleDeleteAll}
                  type="button"
                  className="btn btn-sm gray-button rounded-circle d-flex align-items-center justify-content-center position-absolute"
                  style={{
                    top: "-10px",
                    right: "-10px",
                    width: "30px",
                    height: "30px",
                    zIndex: 1,
                  }}
                >
                  <i className="bx bx-trash fs-6 lh-1"></i>
                </Button>
              </OverlayTrigger>

              <Card
                className="border-0 transparent-bg"
                style={
                  showAdvanced
                    ? { height: "auto", minHeight: "28rem", maxHeight: "40rem" }
                    : { minHeight: "28rem", maxHeight: "28rem" }
                }
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
                          width: "95%",
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
                              <OverlayTrigger
                                placement="bottom"
                                overlay={
                                  <Tooltip id="button-tooltip-2">
                                    Delete Time Log
                                  </Tooltip>
                                }
                              >
                                <Button
                                  type="button"
                                  onClick={() => handleDelete(log.id)}
                                  className="btn btn-sm btn-danger rounded-circle p-1 d-flex align-items-center justify-content-center w-100 h-100"
                                >
                                  <i className="bx bx-trash fs-6 lh-1"></i>
                                </Button>
                              </OverlayTrigger>
                            </div>
                          </div>
                        </Card.Header>
                        <Card.Body className="p-1">
                          <div className="row">
                            <div className="col d-flex flex-column gap-1 text-muted">
                              {/* Time In row with Lunch Break indicator */}
                              <div className="m-0 px-2 d-flex justify-content-between align-items-center">
                                <Card.Text
                                  className="p-0 m-0"
                                  style={{
                                    fontSize: "clamp(0.75rem, 1vw, 1rem)",
                                  }}
                                >
                                  Time In: {formatTimeToAMPM(log.time_in)}
                                </Card.Text>
                                {log.lunch_break && (
                                  <Card.Text
                                    className="p-0 m-0 d-flex align-items-center"
                                    style={{
                                      fontSize: "clamp(0.75rem, 1vw, 1rem)",
                                    }}
                                  >
                                    <i className="bx bx-restaurant me-1"></i>
                                    <span>Lunch Break</span>
                                  </Card.Text>
                                )}
                              </div>

                              {/* Time Out and Hours row */}
                              <div className="m-0 px-2 d-flex align-items-center">
                                <div className="me-auto">
                                  <Card.Text
                                    className="m-0"
                                    style={{
                                      fontSize: "clamp(0.75rem, 1vw, 1rem)",
                                    }}
                                  >
                                    Time Out: {formatTimeToAMPM(log.time_out)}
                                  </Card.Text>
                                </div>
                                <div>
                                  <Card.Text
                                    className="text-success fw-bold text-nowrap d-flex align-items-center m-0"
                                    style={{
                                      fontSize: "clamp(0.75rem, 1vw, 1rem)",
                                    }}
                                  >
                                    <i className="bx bx-plus fs-6 me-1"></i>
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
        showAdvanced={showAdvanced}
        setShowAdvanced={setShowAdvanced}
        handleCloseModal={handleCloseModal}
      />

      <EditTotalHoursModal
        show={showEditTotalHoursModal}
        hoursRequired={hoursRequired}
        user={user}
        fetchHoursRequired={fetchHoursRequired}
        handleCloseEditHours={handleCloseEditHours}
      />

      <SetDefaultLogs
        show={showSetDefaultLogs}
        handleCloseSetDefaultLogs={handleCloseSetDefaultLogs}
      />
    </div>
  );
};

export default Dashboard;
