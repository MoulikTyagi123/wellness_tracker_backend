export const exportToCSV = (data, filename = "analytics.csv") => {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  const headers = Object.keys(data[0]);

  // ✅ FORMAT FUNCTION (SAFE & SIMPLE)
  const formatValue = (field, value) => {
    // empty values → blank
    if (value === null || value === undefined) return "";

    // ✅ DATE FIX (Excel friendly, no ####)
    if (field === "date") {
      const d = new Date(value);
      return `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
    }

    // ✅ NORMAL VALUES
    return value;
  };

  const csvRows = [
    headers.join(","),

    ...data.map((row) =>
      headers.map((field) => formatValue(field, row[field])).join(","),
    ),
  ];

  const csvString = csvRows.join("\n");

  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  window.URL.revokeObjectURL(url);
};
