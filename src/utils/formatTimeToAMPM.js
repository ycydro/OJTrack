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

export default formatTimeToAMPM;
