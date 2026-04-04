import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatsCard } from '@/components/StatsCard';
import { mockComplaints } from '@/data/mockData';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const StudentDashboard = () => {
  const { user } = useAuth();
  const myComplaints = mockComplaints.filter((c) => c.studentId === user?.id);

  const stats = {
    total: myComplaints.length,
    pending: myComplaints.filter((c) => c.status === 'Pending').length,
    assigned: myComplaints.filter((c) => c.status === 'Assigned').length,
    completed: myComplaints.filter((c) => c.status === 'Completed').length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Welcome, {user?.firstName}
            </h1>
            <p className="text-muted-foreground">Track your residence complaints</p>
          </div>
          <Link to="/submit-complaint">
            <Button>+ Report New Issue</Button>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Total Complaints" value={stats.total} />
          <StatsCard title="Pending" value={stats.pending} />
          <StatsCard title="Assigned" value={stats.assigned} />
          <StatsCard title="Completed" value={stats.completed} />
        </div>

        <div>
          <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">Recent Complaints</h2>
          {myComplaints.length === 0 ? (
            <div className="rounded-xl border bg-card p-12 text-center">
              <p className="text-muted-foreground">No complaints yet</p>
              <Link to="/submit-complaint">
                <Button variant="outline" className="mt-4">+ Report New Issue</Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Block</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Location</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Category</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Priority</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Date</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Assigned To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myComplaints.map((c, i) => (
                      <motion.tr
                        key={c.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <Link to={`/complaint/${c.id}`} className="font-medium text-foreground hover:text-primary transition-colors">
                            {c.title}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{c.block}</td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                          {c.locationType === 'Room' ? `Room ${c.room}` : c.facility}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{c.category}</td>
                        <td className="px-4 py-3 text-muted-foreground">{c.priority}</td>
                        <td className="px-4 py-3 text-foreground">{c.status}</td>
                        <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{c.dateSubmitted}</td>
                        <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{c.assignedToName || '—'}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
