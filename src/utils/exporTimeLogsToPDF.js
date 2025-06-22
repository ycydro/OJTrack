import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";
import formatTimeToAMPM from "./formatTimeToAMPM";

const exporTimeLogsToPDF = (data) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("OJT Progress", 14, 22);
  const tableData = data.map((entry) => [
    dayjs(entry?.date).format("MMMM DD, YYYY"),
    formatTimeToAMPM(entry?.time_in),
    formatTimeToAMPM(entry?.time_out),
    entry?.total_hours_today,
    entry?.lunch_break ? "Yes" : "No",
  ]);

  autoTable(doc, {
    head: [["Date", "Time In", "Time Out", "Total Hours", "Lunch Break"]],
    body: tableData,
    startY: 30,
  });
  const today = dayjs().format("MMMM-DD-YYYY");
  doc.save(`OJT-PROGRESS-${today.toUpperCase()}.pdf`);
};

export default exporTimeLogsToPDF;
