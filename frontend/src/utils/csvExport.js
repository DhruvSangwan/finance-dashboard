// =============================================================
// CSV EXPORT UTILITY (utils/csvExport.js)
// Converts expense data to CSV format and triggers a download
// No library needed — pure JavaScript
// =============================================================

export const exportToCSV = (expenses) => {
  if (!expenses || expenses.length === 0) {
    alert('No expenses to export.');
    return;
  }

  // Define the CSV column headers
  const headers = ['Date', 'Title', 'Category', 'Amount', 'Notes'];

  // Convert each expense object to a CSV row
  const rows = expenses.map(expense => [
    expense.expense_date,                            // Date
    `"${expense.title}"`,                            // Wrap in quotes in case title has commas
    expense.category,                                // Category
    parseFloat(expense.amount).toFixed(2),           // Amount with 2 decimal places
    `"${expense.notes || ''}"`,                      // Notes (empty string if null)
  ]);

  // Combine headers and rows into CSV string
  // \n = newline (new row), comma = column separator
  const csvContent = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');

  // Create a downloadable file using the Blob API
  // Blob = Binary Large Object — a file-like object in the browser
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create a temporary URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Create an invisible link and click it programmatically
  const link = document.createElement('a');
  link.href = url;
  link.download = `expenses-${new Date().toISOString().slice(0, 10)}.csv`; // e.g. expenses-2024-03-15.csv
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
