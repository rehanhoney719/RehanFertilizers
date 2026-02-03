interface StatCardProps {
  title: string;
  value: string;
  gradient: string;
}

export default function StatCard({ title, value, gradient }: StatCardProps) {
  return (
    <div
      className="stat-card"
      style={{ borderLeft: `4px solid ${gradient}` }}
    >
      <h3 style={{ color: "var(--slate-500)" }}>{title}</h3>
      <div className="value" style={{ color: "var(--slate-800)" }}>{value}</div>
    </div>
  );
}
