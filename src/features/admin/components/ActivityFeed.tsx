
const ADMIN_COLORS = {
  blue: "#4F8CFF",
  green: "#00D084",
  text: "#e8edf5",
  muted: "rgba(232,237,245,0.45)"
};

export default function ActivityFeed({ items }: { items: { text: string, at: string, type?: string }[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {items.map((item, idx) => (
        <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: item.type === "success" ? ADMIN_COLORS.green : ADMIN_COLORS.blue, boxShadow: item.type === "success" ? "0 0 8px #00D08488" : "0 0 8px #4F8CFF88", display: "inline-block" }} />
          <span style={{ color: ADMIN_COLORS.text, fontWeight: 600 }}>{item.text}</span>
          <span style={{ color: ADMIN_COLORS.muted, fontSize: 13, marginLeft: "auto" }}>{item.at}</span>
        </div>
      ))}
    </div>
  );
}
