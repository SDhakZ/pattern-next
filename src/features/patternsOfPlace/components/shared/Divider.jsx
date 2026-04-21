export function Divider({ T }) {
  return (
    <div
      style={{
        width: "100%",
        alignSelf: "stretch",
        flexShrink: 0,
        height: 1,
        margin: "16px 0",
        background: `linear-gradient(90deg, transparent 0%, ${T.brd} 18%, ${T.brd} 82%, transparent 100%)`,
        opacity: 0.95,
      }}
    />
  );
}
