import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";
import formatTimeToAMPM from "./formatTimeToAMPM";

const exporTimeLogsToPDF = (data) => {
  const doc = new jsPDF();
  // start sa oldest date
  const ascData = data?.reverse();

  doc.setFontSize(18);

  // center title
  const title = "OJT Rendered Hours";
  const pageWidth = doc.internal.pageSize.getWidth();
  const textWidth = doc.getTextWidth(title);
  const x = (pageWidth - textWidth) / 2;

  doc.text(title, x, 15); // Draw title in 10(y) coords

  const tableData = ascData?.map((entry) => [
    dayjs(entry?.date).format("MMMM DD, YYYY"),
    formatTimeToAMPM(entry?.time_in),
    formatTimeToAMPM(entry?.time_out),
    entry?.total_hours_today,
    entry?.lunch_break ? "Yes" : "No",
  ]);

  autoTable(doc, {
    head: [["Date", "Time In", "Time Out", "Total Hours", "Lunch Break"]],
    body: tableData,
    startY: 23,
    styles: {
      halign: "center",
    },
    headStyles: {
      halign: "center",
    },
  });

  const today = dayjs().format("MMMM-DD-YYYY");
  doc.save(`OJT-PROGRESS-${today.toUpperCase()}.pdf`);
};

export default exporTimeLogsToPDF;
