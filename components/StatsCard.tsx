interface StatsCardProps {
  title: string;
  value: number | string;
}

export const StatsCard = ({ title, value }: StatsCardProps) => (
  <div className="rounded-xl border bg-card p-5 shadow-sm">
    <p className="text-sm font-medium text-muted-foreground">{title}</p>
    <p className="mt-1 text-2xl font-bold font-heading text-foreground">{value}</p>
  </div>
);
