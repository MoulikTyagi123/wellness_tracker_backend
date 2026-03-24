export const exportToCSV = (data, filename = "analytics.csv") => {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  const headers = Object.keys(data[0]);

  const formatValue = (field, value) => {
    if (value === null || value === undefined) return "";

    // 🔥 FORCE TEXT (BEST FIX)
    if (field === "date") {
      const d = new Date(value);

      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();

      return `'${day}-${month}-${year}`;
      // 👆 single quote = Excel treats as TEXT (NO #####)
    }

    return value;
  };

  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      headers.map((field) => formatValue(field, row[field])).join(","),
    ),
  ];

  const blob = new Blob([csvRows.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });

  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  window.URL.revokeObjectURL(url);
};
