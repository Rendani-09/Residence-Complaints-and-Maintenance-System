import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { mockComplaints, mockContractors } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ComplaintStatus } from '@/types';

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const complaint = mockComplaints.find((c) => c.id === id);

  const [status, setStatus] = useState<ComplaintStatus>(complaint?.status || 'Pending');
  const [assignedTo, setAssignedTo] = useState(complaint?.assignedTo || '');
  const [note, setNote] = useState('');

  if (!complaint) {
    return (
      <DashboardLayout>
        <div className="py-12 text-center text-muted-foreground">Complaint not found</div>
      </DashboardLayout>
    );
  }

  const isAdmin = user?.role === 'admin';

  const handleAssignContractor = () => {
    if (!assignedTo) return;
    setStatus('Assigned');
    const contractor = mockContractors.find((c) => c.id === assignedTo);
    toast({
      title: 'Contractor Assigned',
      description: `${contractor?.name} has been assigned to this complaint. Status changed to Assigned.`,
    });
  };

  const handleMarkCompleted = () => {
    setStatus('Completed');
    toast({
      title: 'Complaint Completed',
      description: 'This complaint has been marked as Completed.',
    });
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Back to list
        </button>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="font-heading text-xl font-bold text-foreground">{complaint.title}</h1>
              <p className="mt-2 text-muted-foreground">{complaint.description}</p>
            </div>
            <div className="text-sm text-foreground font-medium">
              Status: {status}
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Location:</span> {complaint.block} — {complaint.locationType === 'Room' ? `Room ${complaint.room}` : complaint.facility}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Date Submitted:</span> {complaint.dateSubmitted}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Student:</span> {complaint.studentName}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Category:</span> {complaint.category}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Priority:</span> {complaint.priority}
            </div>
            {complaint.assignedToName && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Assigned To:</span> {complaint.assignedToName}
              </div>
            )}
          </div>
        </div>

        {/* Admin management section */}
        {isAdmin && (
          <div className="mt-6 rounded-xl border bg-card p-6 shadow-sm space-y-6">
            <h2 className="font-heading text-lg font-semibold text-foreground">Manage Complaint</h2>

            {/* Assign contractor */}
            <div className="space-y-2">
              <Label>Assign Contractor</Label>
              <div className="flex gap-2">
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a contractor" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockContractors.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} — {c.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleAssignContractor} disabled={!assignedTo}>
                  Assign Contractor
                </Button>
              </div>
            </div>

            {/* Add note */}
            <div className="space-y-2">
              <Label>Add Note</Label>
              <Textarea
                placeholder="Add a note or comment..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            {/* Mark completed */}
            <Button
              onClick={handleMarkCompleted}
              disabled={status === 'Completed'}
              variant={status === 'Completed' ? 'outline' : 'default'}
              className="w-full sm:w-auto"
            >
              Mark as Completed
            </Button>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default ComplaintDetail;
