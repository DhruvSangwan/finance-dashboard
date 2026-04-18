// =============================================================
// CSV EXPORT (utils/csvExport.js)
// Converts expense array to CSV and triggers browser download
// =============================================================

export const exportToCSV = (expenses, symbol = '₹') => {
  if (!expenses || expenses.length === 0) {
    alert('No expenses to export.');
    return;
  }

  const headers = ['Date', 'Title', 'Category', `Amount (${symbol})`, 'Notes'];

  const rows = expenses.map(e => [
    e.expense_date,
    `"${e.title}"`,
    e.category,
    parseFloat(e.amount).toFixed(2),
    `"${e.notes || ''}"`,
  ]);

  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `expenses-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
