import { useRef, useEffect, useCallback, useState } from "react";
import { FONT } from "../../data/constants/themes.js";

// ─── Color math ──────────────────────────────────────────────────────────────

function hsvToRgb(h, s, v) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

function hsvToHex(h, s, v) {
  const [r, g, b] = hsvToRgb(h, s, v);
  return rgbToHex(r, g, b);
}

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const n = parseInt(
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h,
    16,
  );
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d > 0) {
    if (max === r) h = ((g - b) / d + 6) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return [h, max > 0 ? d / max : 0, max];
}

export function hexToHsv(hex) {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHsv(r, g, b);
}

// ─── Harmony modes ────────────────────────────────────────────────────────────

const HARMONY_MODES = [
  {
    id: "complementary",
    label: "Complementary",
    offsets: [0, 180, 180, 30, -30],
  },
  { id: "analogous", label: "Analogous", offsets: [0, 30, 60, -30, -60] },
  { id: "triadic", label: "Triadic", offsets: [0, 120, 240, 60, 180] },
  { id: "split", label: "Split", offsets: [0, 150, 210, 30, -30] },
  { id: "tetradic", label: "Tetradic", offsets: [0, 90, 180, 270, 45] },
];

function generatePalette(h, s, v, harmonyId) {
  const mode =
    HARMONY_MODES.find((m) => m.id === harmonyId) ?? HARMONY_MODES[0];
  return mode.offsets.map((off, i) => {
    const hue = (((h + off) % 360) + 360) % 360;
    // Vary saturation and value slightly across slots for visual richness
    const sv = Math.min(
      1,
      Math.max(0.15, s - (i === 1 ? 0.15 : i === 3 ? 0.2 : 0)),
    );
    const vv = Math.min(
      1,
      Math.max(0.2, v + (i === 2 ? 0.1 : i === 4 ? -0.1 : 0)),
    );
    return hsvToHex(hue, sv, vv);
  });
}

// ─── Canvas drawing ───────────────────────────────────────────────────────────

function drawDisc(ctx, cx, cy, radius, brightness) {
  const imgData = ctx.createImageData(radius * 2, radius * 2);
  const { data } = imgData;
  for (let py = 0; py < radius * 2; py++) {
    for (let px = 0; px < radius * 2; px++) {
      const dx = px - radius;
      const dy = py - radius;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > radius) continue;
      // hue: 0° at top, clockwise (matches Procreate orientation)
      let hue = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
      const sat = dist / radius;
      const [r, g, b] = hsvToRgb(hue, sat, brightness);
      const idx = (py * radius * 2 + px) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, cx - radius, cy - radius);
}

function drawHandle(ctx, x, y, color, radius = 9, isMain = false) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = isMain ? "#fff" : "rgba(255,255,255,0.7)";
  ctx.lineWidth = isMain ? 2.5 : 1.5;
  ctx.stroke();
}

function hueToXY(hue, sat, cx, cy, radius) {
  const rad = ((hue - 90) * Math.PI) / 180;
  return {
    x: cx + Math.cos(rad) * sat * radius,
    y: cy + Math.sin(rad) * sat * radius,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

const DISC_SIZE = 200;

export function ColorHarmonyWheel({
  colors,
  onChange,
  layerCount = 5,
  T,
  emitOnInteractionOnly = false,
}) {
  const canvasRef = useRef(null);
  const draggingRef = useRef(false);
  const hasInteractedRef = useRef(false);

  // Derive HSV from first color in the palette
  const [hsv, setHsv] = useState(() => {
    const [h, s, v] = hexToHsv(colors[0] ?? "#e85d3a");
    return { h, s, v };
  });
  const [harmonyId, setHarmonyId] = useState("complementary");

  const cx = DISC_SIZE / 2;
  const cy = DISC_SIZE / 2;
  const radius = DISC_SIZE / 2 - 4;

  // Redraw whenever HSV or harmony changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, DISC_SIZE, DISC_SIZE);
    drawDisc(ctx, cx, cy, radius, hsv.v);

    // Draw dashed connector lines between harmony handles
    const mode = HARMONY_MODES.find((m) => m.id === harmonyId);
    const palette = generatePalette(hsv.h, hsv.s, hsv.v, harmonyId);

    ctx.save();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 1;
    const mainPos = hueToXY(hsv.h, hsv.s, cx, cy, radius);
    mode.offsets.forEach((off, i) => {
      if (i === 0 || i >= layerCount) return;
      const hue = (((hsv.h + off) % 360) + 360) % 360;
      const pos = hueToXY(hue, hsv.s, cx, cy, radius);
      ctx.beginPath();
      ctx.moveTo(mainPos.x, mainPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    });
    ctx.restore();

    // Draw harmony handles (smaller, behind main)
    mode.offsets.forEach((off, i) => {
      if (i === 0 || i >= layerCount) return;
      const hue = (((hsv.h + off) % 360) + 360) % 360;
      const pos = hueToXY(hue, hsv.s, cx, cy, radius);
      drawHandle(ctx, pos.x, pos.y, palette[i], 7, false);
    });

    // Draw main handle
    drawHandle(ctx, mainPos.x, mainPos.y, palette[0], 9, true);
  }, [hsv, harmonyId, cx, cy, radius]);

  // Emit palette whenever HSV/harmony changes
  useEffect(() => {
    if (emitOnInteractionOnly && !hasInteractedRef.current) return;
    const palette = generatePalette(hsv.h, hsv.s, hsv.v, harmonyId);
    onChange(palette);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hsv, harmonyId, emitOnInteractionOnly]);

  const applyPointer = useCallback(
    (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const dx = px - cx;
      const dy = py - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const hue = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
      const sat = Math.min(1, dist / radius);
      setHsv((prev) => ({ ...prev, h: hue, s: sat }));
    },
    [cx, cy, radius],
  );

  const onPointerDown = useCallback(
    (e) => {
      hasInteractedRef.current = true;
      draggingRef.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      applyPointer(e);
    },
    [applyPointer],
  );

  const onPointerMove = useCallback(
    (e) => {
      if (!draggingRef.current) return;
      applyPointer(e);
    },
    [applyPointer],
  );

  const onPointerUp = useCallback(() => {
    draggingRef.current = false;
  }, []);

  const palette = generatePalette(hsv.h, hsv.s, hsv.v, harmonyId);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: 10,
        border: `1px solid ${T.brd}`,
        borderRadius: 12,
        background: T.surf1,
      }}
    >
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {HARMONY_MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setHarmonyId(m.id)}
            style={{
              padding: "6px 12px",
              fontSize: 10,
              fontFamily: FONT,
              fontWeight: harmonyId === m.id ? 700 : 600,
              background: harmonyId === m.id ? T.gold : T.surf2,
              color: harmonyId === m.id ? "#111" : T.mut,
              border: `1px solid ${harmonyId === m.id ? T.gold : T.brd}`,
              borderRadius: 999,
              cursor: "pointer",
              transition: "all 0.12s",
              letterSpacing: "0.03em",
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <canvas
          ref={canvasRef}
          width={DISC_SIZE}
          height={DISC_SIZE}
          style={{
            borderRadius: "50%",
            cursor: "crosshair",
            touchAction: "none",
            border: `1px solid ${T.brd}`,
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            fontSize: 9,
            color: T.mut,
            minWidth: 24,
            textAlign: "right",
          }}
        >
          Brt
        </span>
        <div style={{ flex: 1, position: "relative" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 4,
              pointerEvents: "none",
              background: `linear-gradient(to right, #000, ${hsvToHex(hsv.h, hsv.s, 1)})`,
            }}
          />
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.01}
            value={hsv.v}
            onChange={(e) => {
              hasInteractedRef.current = true;
              setHsv((prev) => ({ ...prev, v: parseFloat(e.target.value) }));
            }}
            style={{
              width: "100%",
              position: "relative",
              opacity: 0,
              cursor: "pointer",
              margin: 0,
              height: 18,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              transform: "translateY(-50%)",
              left: `calc(${((hsv.v - 0.1) / 0.9) * 100}% - 7px)`,
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: hsvToHex(hsv.h, hsv.s, hsv.v),
              border: "2px solid #fff",
              pointerEvents: "none",
              boxShadow: "0 0 4px rgba(0,0,0,0.5)",
            }}
          />
        </div>
        <span
          style={{ fontSize: 9, color: T.mut, fontFamily: FONT, minWidth: 28 }}
        >
          {Math.round(hsv.v * 100)}%
        </span>
      </div>

      <div
        style={{
          display: "flex",
          gap: 0,
          borderRadius: 5,
          overflow: "hidden",
          border: `1px solid ${T.brd}`,
          height: 32,
        }}
      >
        {palette.slice(0, layerCount).map((c, i) => (
          <div
            key={i}
            title={c}
            style={{ flex: 1, background: c, cursor: "default" }}
          />
        ))}
      </div>
    </div>
  );
}
