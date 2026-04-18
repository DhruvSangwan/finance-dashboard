// =============================================================
// CHARTS (components/Charts.jsx)
// Monthly bar chart + category pie chart using Recharts
// =============================================================

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  LineChart, Line, Area, AreaChart
} from 'recharts';
import { useCurrency } from '../context/CurrencyContext';

const COLORS = ['#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#10b981', '#6b7280'];

export const MonthlyChart = ({ data }) => {
  const { symbol } = useCurrency();
  if (!data || data.length === 0) return <div className="chart-empty">No monthly data yet.</div>;

  const chartData = data.map(item => ({
    month: item.month,
    total: parseFloat(parseFloat(item.total).toFixed(2))
  }));

  return (
    <div className="chart-container">
      <h3>Monthly Spending</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={v => `${symbol}${v}`} tick={{ fontSize: 11 }} width={65} />
          <Tooltip formatter={v => [`${symbol}${v.toFixed(2)}`, 'Spent']} />
          <Bar dataKey="total" fill="#3b82f6" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const CategoryChart = ({ data }) => {
  const { symbol } = useCurrency();
  if (!data || data.length === 0) return <div className="chart-empty">No category data this month.</div>;

  const chartData = data.map(item => ({
    name: item.category,
    value: parseFloat(parseFloat(item.total).toFixed(2))
  }));

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
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
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" outerRadius={85} dataKey="value" labelLine={false} label={renderLabel}>
            {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={v => [`${symbol}${v.toFixed(2)}`, 'Spent']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const TrendChart = ({ data }) => {
  const { symbol } = useCurrency();
  if (!data || data.length === 0) return <div className="chart-empty">No trend data yet.</div>;

  const chartData = data.map(item => ({
    month: item.month,
    total: parseFloat(parseFloat(item.total).toFixed(2))
  }));

  return (
    <div className="chart-container">
      <h3>Spending Trend</h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={v => `${symbol}${v}`} tick={{ fontSize: 11 }} width={65} />
          <Tooltip formatter={v => [`${symbol}${v.toFixed(2)}`, 'Spent']} />
          <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} fill="url(#colorTotal)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
