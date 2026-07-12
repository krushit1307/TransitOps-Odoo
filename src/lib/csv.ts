/**
 * Utility to convert an array of data objects to CSV format and trigger a browser download.
 */

export interface CSVColumn<T> {
  key: keyof T | string;
  label: string;
  transform?: (val: any) => string | number;
}

export function downloadCSV<T>(
  data: T[],
  columns: CSVColumn<T>[],
  filename: string
) {
  // Generate headers row
  const headerRow = columns
    .map((col) => `"${col.label.replace(/"/g, '""')}"`)
    .join(",");

  // Generate data rows
  const dataRows = data.map((item) => {
    return columns
      .map((col) => {
        let val = (item as any)[col.key];

        // Apply custom transform if defined
        if (col.transform) {
          val = col.transform(val);
        }

        const strVal = val === null || val === undefined ? "" : String(val);
        
        // Escape double quotes by doubling them
        const escaped = strVal.replace(/"/g, '""');
        return `"${escaped}"`;
      })
      .join(",");
  });

  const csvContent = [headerRow, ...dataRows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  // Trigger browser download
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    filename.endsWith(".csv") ? filename : `${filename}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
