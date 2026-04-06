import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BLOCKS, ROOMS, FACILITIES, CATEGORIES, PRIORITIES } from '@/types';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const SubmitComplaint = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState({
    title: '',
    description: '',
    block: '',
    locationType: '' as 'Room' | 'Facility' | '',
    room: '',
    facility: '',
    category: '',
    priority: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.block || !form.locationType || !form.category || !form.priority) {
      toast({ title: 'Missing Fields', description: 'Please fill in all required fields.' });
      return;
    }
    if (form.locationType === 'Room' && !form.room) {
      toast({ title: 'Missing Room', description: 'Please select a room number.' });
      return;
    }
    if (form.locationType === 'Facility' && !form.facility) {
      toast({ title: 'Missing Facility', description: 'Please select a facility.' });
      return;
    }
    toast({
      title: 'Complaint Submitted',
      description: 'Your complaint has been logged and will be reviewed shortly.',
    });
    navigate('/dashboard');
  };

  const isLaundryBlock = form.block === 'Block 23 (Laundry)';

  // When laundry block is selected, force location type to Facility
  const effectiveLocationType = isLaundryBlock ? 'Facility' : form.locationType;

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl"
      >
        <h1 className="font-heading text-2xl font-bold text-foreground">Submit a Complaint</h1>
        <p className="mt-1 text-muted-foreground">Fill in the details below to report an issue</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Brief description of the issue"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide more details about the problem..."
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Block</Label>
            <Select value={form.block} onValueChange={(v) => setForm({ ...form, block: v, locationType: '', room: '', facility: '' })}>
              <SelectTrigger>
                <SelectValue placeholder="Select block" />
              </SelectTrigger>
              <SelectContent>
                {BLOCKS.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {form.block && !isLaundryBlock && (
            <div className="space-y-2">
              <Label>Location Type</Label>
              <Select value={form.locationType} onValueChange={(v) => setForm({ ...form, locationType: v as 'Room' | 'Facility', room: '', facility: '' })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Room">Room</SelectItem>
                  <SelectItem value="Facility">Facility</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {effectiveLocationType === 'Room' && (
            <div className="space-y-2">
              <Label>Room Number</Label>
              <Select value={form.room} onValueChange={(v) => setForm({ ...form, room: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select room number" />
                </SelectTrigger>
                <SelectContent>
                  {ROOMS.map((r) => (
                    <SelectItem key={r} value={String(r)}>Room {r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {effectiveLocationType === 'Facility' && (
            <div className="space-y-2">
              <Label>Facility</Label>
              <Select value={form.facility} onValueChange={(v) => setForm({ ...form, facility: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select facility" />
                </SelectTrigger>
                <SelectContent>
                  {(isLaundryBlock ? ['Laundry'] as const : FACILITIES).map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full">
            Submit Complaint
          </Button>
        </form>
      </motion.div>
    </DashboardLayout>
  );
};

export default SubmitComplaint;
