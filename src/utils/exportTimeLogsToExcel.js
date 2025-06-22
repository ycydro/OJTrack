import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import formatTimeToAMPM from "./formatTimeToAMPM";

const exportTimeLogsToExcel = (data) => {
  const formatted = data.map((entry) => ({
    Date: dayjs(entry?.date).format("MMMM DD, YYYY"),
    "Time In": formatTimeToAMPM(entry?.time_in),
    "Time Out": formatTimeToAMPM(entry?.time_out),
    "Total Hours": Math.floor(entry?.total_hours_today),
    "Lunch Break": entry?.lunch_break ? "Yes" : "No",
  }));

  const totalHours = data.reduce(
    (acc, curr) => acc + curr.total_hours_today,
    0
  );

  // Add blank + total hours row
  formatted.push({});
  formatted.push({
    "Time Out": "Total Hours:",
    "Total Hours": totalHours.toFixed(2),
  });

  const worksheet = XLSX.utils.json_to_sheet(formatted);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Time Logs");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
    cellStyles: true,
  });

  const file = new Blob([excelBuffer], { type: "application/octet-stream" });
  const today = dayjs().format("MMMM-DD-YYYY");
  saveAs(file, `OJT-PROGRESS-${today.toUpperCase()}.xlsx`);
};

export default exportTimeLogsToExcel;
