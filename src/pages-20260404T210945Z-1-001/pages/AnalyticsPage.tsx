import { DashboardLayout } from '@/components/DashboardLayout';
import { mockComplaints } from '@/data/mockData';
import { BLOCKS, CATEGORIES } from '@/types';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['hsl(262, 83%, 58%)', 'hsl(210, 80%, 55%)', 'hsl(38, 92%, 50%)', 'hsl(152, 60%, 42%)'];

const AnalyticsPage = () => {
  // Complaints per block (only blocks with complaints)
  const blockData = BLOCKS
    .map((b) => ({ name: b.replace('Block ', 'B'), count: mockComplaints.filter((c) => c.block === b).length }))
    .filter((d) => d.count > 0);

  // Complaints by category
  const categoryData = CATEGORIES.map((cat) => ({
    name: cat,
    value: mockComplaints.filter((c) => c.category === cat).length,
  }));

  // Status distribution
  const statusData = [
    { name: 'Pending', value: mockComplaints.filter((c) => c.status === 'Pending').length },
    { name: 'Assigned', value: mockComplaints.filter((c) => c.status === 'Assigned').length },
    { name: 'Completed', value: mockComplaints.filter((c) => c.status === 'Completed').length },
  ];

  const STATUS_COLORS = ['hsl(38, 92%, 50%)', 'hsl(210, 80%, 55%)', 'hsl(152, 60%, 42%)'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Complaint trends and insights</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Complaints by Block */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border bg-card p-6 shadow-sm"
          >
            <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">Complaints per Block</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={blockData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(260, 15%, 90%)" />
                  <XAxis dataKey="name" fontSize={12} tick={{ fill: 'hsl(260, 10%, 45%)' }} />
                  <YAxis fontSize={12} tick={{ fill: 'hsl(260, 10%, 45%)' }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid hsl(260, 15%, 90%)',
                      backgroundColor: 'hsl(0, 0%, 100%)',
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(262, 83%, 58%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* By Category */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border bg-card p-6 shadow-sm"
          >
            <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">By Category</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                    {categoryData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Status Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border bg-card p-6 shadow-sm lg:col-span-2"
          >
            <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">Status Distribution</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(260, 15%, 90%)" />
                  <XAxis type="number" fontSize={12} tick={{ fill: 'hsl(260, 10%, 45%)' }} />
                  <YAxis type="category" dataKey="name" fontSize={12} tick={{ fill: 'hsl(260, 10%, 45%)' }} width={80} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {statusData.map((_, index) => (
                      <Cell key={index} fill={STATUS_COLORS[index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
