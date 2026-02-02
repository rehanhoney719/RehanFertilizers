interface StatCardProps {
  title: string;
  value: string;
  gradient: string;
  darkText?: boolean;
}

export default function StatCard({ title, value, gradient, darkText }: StatCardProps) {
  return (
    <div
      className="stat-card"
      style={{
        background: gradient,
        color: darkText ? "#34495e" : "white",
      }}
    >
      <h3>{title}</h3>
      <div className="value">{value}</div>
    </div>
  );
}
