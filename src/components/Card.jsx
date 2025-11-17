function Card({ title, value, icon, color }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 flex items-start justify-between hover:shadow-lg transition-smooth">
      <div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className={`text-3xl font-bold text-${color}-500`}>{value}</p>
      </div>
      <div className={`p-2 bg-${color}-500/10 rounded-lg`}>{icon}</div>
    </div>
  );
}

export default Card;
