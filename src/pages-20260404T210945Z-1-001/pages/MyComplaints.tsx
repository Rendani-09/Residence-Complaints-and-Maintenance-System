import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { mockComplaints } from '@/data/mockData';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const MyComplaints = () => {
  const { user } = useAuth();
  const myComplaints = mockComplaints.filter((c) => c.studentId === user?.id);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">My Complaints</h1>
          <p className="text-muted-foreground">View all your submitted complaints and their status</p>
        </div>

        {myComplaints.length === 0 ? (
          <div className="rounded-xl border bg-card p-12 text-center">
            <p className="text-muted-foreground">You have not submitted any complaints yet.</p>
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
    </DashboardLayout>
  );
};

export default MyComplaints;
