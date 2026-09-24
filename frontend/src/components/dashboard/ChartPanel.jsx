import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

export const PriorityBarChart = ({ data }) => {
  const chartData = Object.entries(data || {}).map(([priority, count]) => ({ priority, count }));

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">Tickets by Priority</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="priority" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const SLATrendChart = ({ data }) => {
  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">SLA Trend</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data || []}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="created" stroke="#3b82f6" strokeWidth={2} name="Created" />
          <Line type="monotone" dataKey="breached" stroke="#dc2626" strokeWidth={2} name="Breached" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};