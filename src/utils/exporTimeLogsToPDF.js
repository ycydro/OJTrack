import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import formatTimeToAMPM from "./formatTimetoAMPM";

const exporTimeLogsToPDF = (data) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("OJT Progress", 14, 22);
  const options = { year: "numeric", month: "long", day: "numeric" };

  const tableData = data.map((entry) => [
    new Date(entry.date).toLocaleDateString("en-US", options),
    formatTimeToAMPM(entry.time_in),
    formatTimeToAMPM(entry.time_out),
    entry.total_hours_today,
    entry.lunch_break ? "Yes" : "No",
  ]);

  autoTable(doc, {
    head: [["Date", "Time In", "Time Out", "Total Hours", "Lunch Break"]],
    body: tableData,
    startY: 30,
  });

  const date = new Date();
  const todayOptions = { month: "long" };
  const month = date.toLocaleDateString("en-US", todayOptions);
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();

  const today = `${month}-${day}-${year}`;
  doc.save(`OJT-PROGRESS-${today.toUpperCase()}.pdf`);
};

export default exporTimeLogsToPDF;
