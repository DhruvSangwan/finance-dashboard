// =============================================================
// CHARTS (components/Charts.jsx)
// Monthly bar chart + category pie chart using Recharts
// Recharts uses React components to render SVG charts
// =============================================================

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

// Colors for the pie chart slices — one per category
const COLORS = ['#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#10b981', '#6b7280'];

// ---------------------------------------------------------------
// MONTHLY BAR CHART: Shows spending per month for last 6 months
// ---------------------------------------------------------------
export const MonthlyChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="chart-empty">No data yet for monthly chart.</div>;
  }

  // Recharts expects: [{ month: "Jan 2024", total: 450.00 }, ...]
  const chartData = data.map(item => ({
    month: item.month,
    // Convert string to number and round to 2 decimal places
    total: parseFloat(parseFloat(item.total).toFixed(2))
  }));

  return (
    <div className="chart-container">
      <h3>Monthly Spending</h3>
      {/* ResponsiveContainer makes chart resize with its parent div */}
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          {/* Grid lines in the background */}
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          
          {/* X axis = months */}
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          
          {/* Y axis = dollar amounts, formatted with $ sign */}
          <YAxis
            tickFormatter={(value) => `$${value}`}
            tick={{ fontSize: 12 }}
            width={60}
          />
          
          {/* Tooltip shows on hover */}
          <Tooltip
            formatter={(value) => [`$${value.toFixed(2)}`, 'Spent']}
          />
          
          {/* The actual bars */}
          <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// ---------------------------------------------------------------
// CATEGORY PIE CHART: Shows spending breakdown by category
// ---------------------------------------------------------------
export const CategoryChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="chart-empty">No category data for this month.</div>;
  }

  const chartData = data.map(item => ({
    name: item.category,
    value: parseFloat(parseFloat(item.total).toFixed(2))
  }));

  // Custom label: shows percentage on each slice
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null; // Don't show label for tiny slices
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="chart-container">
      <h3>This Month by Category</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={90}
            dataKey="value"
            labelLine={false}
            label={renderLabel}
          >
            {/* Each slice gets a color from our COLORS array */}
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Spent']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
