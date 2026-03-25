
const BADGE_COLORS: Record<string, string> = {
  basic: "#4F8CFF",
  enterprise: "#F59E0B",
  active: "#00D084",
  suspended: "#EF4444",
  default: "#e8edf5"
};

export default function Badge({ label, type }: { label: string, type: string }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 12px",
      borderRadius: 8,
      fontSize: 13,
      fontWeight: 700,
      background: BADGE_COLORS[type] + '22',
      color: BADGE_COLORS[type] || BADGE_COLORS.default,
      border: `1px solid ${BADGE_COLORS[type] || BADGE_COLORS.default}`,
      marginRight: 6
    }}>{label}</span>
  );
}
