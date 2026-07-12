import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function downloadPDF(
  data: any[],
  columns: { key: string; label: string; transform?: (val: any) => string }[],
  filename: string
) {
  const doc = new jsPDF();
  
  doc.setFontSize(16);
  doc.text(`TransitOps: ${filename.replace(/_/g, " ").toUpperCase()}`, 14, 20);
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);
  
  const head = [columns.map((c) => c.label)];
  const body = data.map((row) => {
    return columns.map((c) => {
      const val = row[c.key];
      return c.transform ? c.transform(val) : val !== undefined && val !== null ? String(val) : "";
    });
  });

  autoTable(doc, {
    startY: 34,
    head: head,
    body: body,
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [109, 40, 217], textColor: 255 }, // TransitOps primary
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  doc.save(`${filename}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
