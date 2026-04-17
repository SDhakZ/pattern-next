import { MOTIFS } from "../../data/motifs/motifRegistry.js";
import { PatternTile } from "../shared/PatternTile.jsx";
import { tangentSize, polar } from "../../domain/geometry.js";
import { DEFAULT_COLORS } from "../../data/constants/defaults.js";
import { FONT } from "../../data/constants/themes.js";

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
  const pad = Math.round(H * 0.08);
  const padRight = Math.round(H * 0.07);
  const borderStyle = { border: `1px solid ${T.brd}` };

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
          display: "flex",
          background: bgColor,
        }}
      >
        <div
          style={{
            flex: 1,
            padding: pad,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            borderRight: `1px solid white`,
            position: "relative",
            zIndex: 1,
            background: bgColor,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 8,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "white",
                marginBottom: 16,
              }}
            >
              Note
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                style={{ height: 1, background: "white", marginBottom: 18 }}
              />
            ))}
          </div>
          <div>
            <div>
              <div
                style={{
                  fontSize: 8,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "white",
                  marginBottom: 8,
                }}
              >
                From
              </div>
              <div
                style={{ height: 1, background: "white", marginBottom: 8 }}
              />
              <div
                style={{
                  fontSize: 9,
                  color: "white",
                  letterSpacing: "0.1em",
                  marginTop: 14,
                }}
              >
                Patterns of Place · 2026
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            width: "30%",
            padding: padRight,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "flex-end",
            position: "relative",
            zIndex: 1,
            background: bgColor,
          }}
        >
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div
              style={{
                fontSize: 7,
                color: "white",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              To
            </div>
            {[90, 74, 74, 55].map((w, i) => (
              <div
                key={i}
                style={{ height: 1, width: `${w}%`, background: "white" }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
