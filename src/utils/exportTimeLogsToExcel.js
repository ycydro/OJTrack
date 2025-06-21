import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import formatTimeToAMPM from "./formatTimeToAMPM";

const exportTimeLogsToExcel = (data) => {
  const options = { year: "numeric", month: "long", day: "numeric" };

  const formatted = data.map((entry) => ({
    Date: new Date(entry.date).toLocaleDateString("en-US", options),
    "Time In": formatTimeToAMPM(entry.time_in),
    "Time Out": formatTimeToAMPM(entry.time_out),
    "Total Hours": Math.floor(entry.total_hours_today),
    "Lunch Break": entry.lunch_break ? "Yes" : "No",
  }));

  const totalHours = data.reduce(
    (acc, curr) => acc + curr.total_hours_today,
    0
  );

  // Add blank + total row
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
    cellStyles: true, // ✅ enable styles
  });

  const file = new Blob([excelBuffer], { type: "application/octet-stream" });
  const date = new Date();
  const todayOptions = { month: "long" };
  const month = date.toLocaleDateString("en-US", todayOptions);
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();

  const today = `${month}-${day}-${year}`;
  saveAs(file, `OJT-PROGRESS-${today}.xlsx`);
};

export default exportTimeLogsToExcel;
