import { FONT } from "../../data/constants/themes.js";
import { getAdaptiveColors } from "../../utils/colorUtils.js";

/**
 * Renders the postcard reverse side.
 *
 * Each item in `reverseRings` is a ring entity identical in shape to Studio rings,
 * but positioned at (x, y) fractions of W/H rather than belonging to a cluster.
 * radius uses the same H=480 reference scale as Studio rings.
 */
export function PostcardReverse({
  T,
  bgColor,
  W,
  H,
  reverseRings = [],
  library = [],
  activeRingId = null,
  template = "default",
  clusters = [],
}) {
  void reverseRings;
  void library;
  void activeRingId;
  void template;
  void clusters;

  const layoutSc = H / 440;
  const pad = Math.round(H * 0.08);
  const padRight = Math.round(H * 0.07);
  const leftW = Math.round(W * 0.7);
  const rightX = leftW;
  const rightW = W - leftW;

  const fsLabel = Math.round(8 * layoutSc);
  const fsBody = Math.round(9 * layoutSc);
  const fsTiny = Math.round(7 * layoutSc);

  // Get adaptive colors based on background luminance
  const colors = getAdaptiveColors(bgColor, T);

  const noteLabelY = pad;
  const noteLineStartY = noteLabelY + Math.round(16 * layoutSc);
  const noteLineGap = Math.round(18 * layoutSc) + 1;

  const fromLabelY = H - pad - Math.round(43 * layoutSc);

  const stampW = Math.round(44 * layoutSc);
  const stampH = Math.round(54 * layoutSc);
  const stampX = rightX + rightW - padRight - stampW;
  const stampY = padRight;

  const toLabelY = H - padRight - Math.round(100 * layoutSc);
  const addrWidths = [0.9, 0.74, 0.74, 0.55];
  const addrAreaW = rightW - 2 * padRight;
  const addrGap = Math.round(18 * layoutSc);

  const borderStyle = { border: `1px solid ${colors.brd}` };

  return (
    <div
      style={{
        width: W,
        height: H,
        background: bgColor,
        borderRadius: 6,
        position: "relative",
        flexShrink: 0,
        fontFamily: FONT,
        overflow: "hidden",
        ...borderStyle,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: bgColor,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: leftW,
          top: 0,
          width: 1,
          height: H,
          background: colors.brd,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: pad,
          top: noteLabelY,
          fontSize: fsLabel,
          fontWeight: 600,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: colors.brd,
        }}
      >
        Note
      </div>

      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={`note-line-${i}`}
          style={{
            position: "absolute",
            left: pad,
            top: noteLineStartY + i * noteLineGap,
            width: leftW - pad * 2,
            height: 1,
            background: colors.brd,
          }}
        />
      ))}

      <div
        style={{
          position: "absolute",
          left: pad,
          top: fromLabelY,
          fontSize: fsLabel,
          fontWeight: 600,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: colors.brd,
        }}
      >
        From
      </div>

      <div
        style={{
          position: "absolute",
          left: pad,
          top: fromLabelY + Math.round(14 * layoutSc),
          width: leftW - pad * 2,
          height: 1,
          background: colors.brd,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: pad,
          bottom: pad,
          fontSize: fsBody,
          fontWeight: 600,
          letterSpacing: "0.1em",
          color: colors.brd,
        }}
      >
        Patterns of Place · 2026
      </div>

      <div
        style={{
          position: "absolute",
          left: stampX,
          top: stampY,
          width: stampW,
          height: stampH,
          border: `2px solid ${colors.brd}`,
          borderRadius: 4,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: Math.round(28 * layoutSc),
            height: Math.round(38 * layoutSc),
            borderRadius: 2,
            background: colors.brd,
            opacity: 0.6,
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: rightX + padRight,
          top: toLabelY,
          fontSize: fsTiny,
          fontWeight: 600,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: colors.brd,
        }}
      >
        To
      </div>

      {addrWidths.map((w, i) => (
        <div
          key={`addr-line-${i}`}
          style={{
            position: "absolute",
            left: rightX + padRight,
            top: toLabelY + Math.round(addrGap * (i + 1)),
            width: addrAreaW * w,
            height: 1,
            background: colors.brd,
          }}
        />
      ))}
    </div>
  );
}
