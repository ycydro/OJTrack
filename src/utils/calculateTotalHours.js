const calculateTotalHours = (timeIn, timeOut, lunchBreak) => {
  if (!timeIn || !timeOut) return 0;

  const [inHours, inMinutes] = timeIn.split(":").map(Number);
  const [outHours, outMinutes] = timeOut.split(":").map(Number);

  const totalMinutes = lunchBreak
    ? outHours * 60 + outMinutes - (inHours * 60 + inMinutes) - 60
    : outHours * 60 + outMinutes - (inHours * 60 + inMinutes);

  return (totalMinutes / 60).toFixed(2);
};

export default calculateTotalHours;
