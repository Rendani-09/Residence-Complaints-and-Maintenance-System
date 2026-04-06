import { ComplaintStatus, ComplaintCategory, Priority } from '@/types';

export const StatusBadge = ({ status }: { status: ComplaintStatus }) => {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium text-muted-foreground bg-muted">
      {status}
    </span>
  );
};

export const CategoryBadge = ({ category }: { category: ComplaintCategory }) => {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-accent text-accent-foreground">
      {category}
    </span>
  );
};

export const PriorityBadge = ({ priority }: { priority: Priority }) => {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
      {priority}
    </span>
  );
};
