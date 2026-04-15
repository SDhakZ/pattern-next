import { useState, useCallback } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { usePatternsOfPlace } from "../../app/PatternsOfPlaceProvider.jsx";
import {
  SET_STAGE,
  SET_THEME,
  SET_PREVIEW_SIDE,
  RESET,
  SET_EXPORT_STATUS,
  ADD_REVERSE_DECORATION,
  REMOVE_REVERSE_DECORATION,
  UPDATE_REVERSE_DECORATION,
  SET_ACTIVE_REVERSE_DECORATION,
  SET_REVERSE_TEMPLATE,
} from "../../app/actions.js";
import {
  selectClusters,
  selectBgColor,
  selectLibrary,
  selectPreviewSide,
  selectExport,
  selectReverseDecorations,
  selectActiveReverseDecoration,
  selectReverseTemplate,
} from "../../app/selectors.js";
import { Button } from "../shared/Button.jsx";
import { Divider } from "../shared/Divider.jsx";
import { Label } from "../shared/Label.jsx";
import { SliderControl } from "../shared/SliderControl.jsx";
import { ColorPicker } from "../shared/ColorPicker.jsx";
import { CardCanvas } from "../shared/CardCanvas.jsx";
import { PatternTile } from "../shared/PatternTile.jsx";
import { PostcardReverse } from "./PostcardReverse.jsx";
import { useExportArtwork } from "../../hooks/useExportArtwork.js";
import {
  MOTIFS,
  MOTIF_NAMES,
  SELECTABLE_MOTIFS,
} from "../../data/motifs/motifRegistry.js";
import { DEFAULT_COLORS } from "../../data/constants/defaults.js";
import { REVERSE_TEMPLATES } from "../../data/constants/templates.js";
import { tangentSize } from "../../domain/geometry.js";
import { FONT, FONT_MONO } from "../../data/constants/themes.js";

const PANEL_STYLE = {
  width: 340,
  flexShrink: 0,
  height: "100%",
  minHeight: 0,
  overflowY: "auto",
  overscrollBehavior: "contain",
  padding: "24px 20px",
  display: "flex",
  flexDirection: "column",
};

function ReversePanel({ T, state, dispatch }) {
  const rings = selectReverseDecorations(state);
  const active = selectActiveReverseDecoration(state);
  const library = selectLibrary(state);
  const reverseTemplate = selectReverseTemplate(state);
  const { activeReverseDecorationId } = state.ui;
  const [setupMode, setSetupMode] = useState("motif");

  const upd = useCallback(
    (key, value) => {
      if (!active) return;
      dispatch({ type: UPDATE_REVERSE_DECORATION, id: active.id, key, value });
    },
    [dispatch, active],
  );

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 6,
        }}
      >
        <Label T={T}>Reverse Rings ({rings.length})</Label>
        <div style={{ display: "flex", gap: 3 }}>
          <Button
            small
            variant="ghost"
            T={T}
            onClick={() => dispatch({ type: ADD_REVERSE_DECORATION })}
          >
            +
          </Button>
          <Button
            small
            variant="ghost"
            T={T}
            disabled={!active}
            onClick={() =>
              active &&
              dispatch({ type: REMOVE_REVERSE_DECORATION, id: active.id })
            }
          >
            −
          </Button>
        </div>
      </div>

      <Divider T={T} />

      <Label T={T}>Reverse Template</Label>
      <div
        style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}
      >
        {REVERSE_TEMPLATES.map((tpl) => (
          <Button
            key={tpl.id}
            small
            variant={reverseTemplate === tpl.id ? "primary" : "secondary"}
            T={T}
            onClick={() => dispatch({ type: SET_REVERSE_TEMPLATE, id: tpl.id })}
          >
            {tpl.name}
          </Button>
        ))}
      </div>

      {rings.length === 0 && (
        <div
          style={{
            fontSize: 11,
            color: T.mut,
            fontStyle: "italic",
            padding: "8px 10px",
            background: T.surf2,
            borderRadius: 4,
            marginBottom: 10,
          }}
        >
          Press + to place a ring on the reverse.
        </div>
      )}

      {rings.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 3,
            flexWrap: "wrap",
            marginBottom: 10,
          }}
        >
          {rings.map((r, i) => {
            const isActive = r.id === activeReverseDecorationId;
            const MC = MOTIFS[r.motifId ?? 0] || MOTIFS[0];
            return (
              <button
                key={r.id}
                onClick={() =>
                  dispatch({ type: SET_ACTIVE_REVERSE_DECORATION, id: r.id })
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 8px",
                  border: `1.5px solid ${isActive ? "#00e5ff" : T.brd}`,
                  background: isActive ? "rgba(0,229,255,0.1)" : "transparent",
                  color: isActive ? T.txt : T.mut,
                  cursor: "pointer",
                  borderRadius: 4,
                  boxShadow: isActive
                    ? "0 0 0 2px rgba(0,229,255,0.25)"
                    : "none",
                  transition: "all 0.15s",
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    background: "#111",
                    borderRadius: 3,
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <MC c={r.colors ?? DEFAULT_COLORS} size={22} />
                </div>
                <span
                  style={{ fontSize: 10, fontWeight: 700, fontFamily: FONT }}
                >
                  R{i + 1}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {active && (
        <>
          <Divider T={T} />

          <SliderControl
            label="Count"
            val={active.count}
            min={2}
            max={60}
            onChange={(v) => upd("count", v)}
            display={active.count}
            T={T}
          />
          <SliderControl
            label="Radius"
            val={active.radius}
            min={20}
            max={200}
            step={2}
            onChange={(v) => upd("radius", v)}
            display={`${active.radius}px`}
            T={T}
          />
          <div
            style={{
              fontSize: 10,
              color: T.mut,
              marginBottom: 10,
              fontFamily: FONT_MONO,
            }}
          >
            Tile: {Math.round(tangentSize(active.radius, active.count))}px
          </div>

          <SliderControl
            label="X position"
            val={Math.round(active.x * 100)}
            min={0}
            max={100}
            onChange={(v) => upd("x", v / 100)}
            display={`${Math.round(active.x * 100)}%`}
            T={T}
          />
          <SliderControl
            label="Y position"
            val={Math.round(active.y * 100)}
            min={0}
            max={100}
            onChange={(v) => upd("y", v / 100)}
            display={`${Math.round(active.y * 100)}%`}
            T={T}
          />
          <Divider T={T} />

          <div style={{ display: "flex", gap: 3, marginBottom: 8 }}>
            {["motif", "preset"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSetupMode(tab)}
                style={{
                  flex: 1,
                  padding: "6px",
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: FONT,
                  border: `1px solid ${setupMode === tab ? T.gold : T.brd}`,
                  background: setupMode === tab ? T.surf2 : "transparent",
                  color: setupMode === tab ? T.gold : T.mut,
                  cursor: "pointer",
                  borderRadius: 4,
                  transition: "all 0.15s",
                  textTransform: "capitalize",
                }}
              >
                {tab === "motif" ? "Single Motif" : "Preset Tile"}
              </button>
            ))}
          </div>

          {setupMode === "motif" ? (
            <>
              <Label T={T}>Motif</Label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: 3,
                  marginBottom: 8,
                }}
              >
                {SELECTABLE_MOTIFS.map(({ id, component: MC, name }) => {
                  const isActive = active.motifId === id;
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        upd("motifId", id);
                        upd("presetId", null);
                      }}
                      aria-label={name}
                      style={{
                        aspectRatio: "1",
                        padding: 1,
                        border: `1.5px solid ${isActive ? "#00e5ff" : T.brd}`,
                        background: isActive
                          ? "rgba(0,229,255,0.1)"
                          : "transparent",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 3,
                        overflow: "hidden",
                        transition: "all 0.15s",
                      }}
                    >
                      <MC c={active.colors ?? DEFAULT_COLORS} size={46} />
                    </button>
                  );
                })}
              </div>
              <ColorPicker
                key={active.id}
                label="Ring Colors"
                colors={active.colors ?? DEFAULT_COLORS}
                onChange={(c) => upd("colors", c)}
                T={T}
              />
            </>
          ) : (
            <>
              <Label T={T}>Pattern Preset</Label>
              {library.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    marginBottom: 8,
                  }}
                >
                  {library.map((pr) => {
                    const isActive = active.presetId === pr.id;
                    return (
                      <button
                        key={pr.id}
                        onClick={() => {
                          upd("presetId", pr.id);
                          upd("motifId", undefined);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "6px 8px",
                          border: `1.5px solid ${isActive ? "#00e5ff" : T.brd}`,
                          background: isActive
                            ? "rgba(0,229,255,0.1)"
                            : "transparent",
                          borderRadius: 4,
                          cursor: "pointer",
                          textAlign: "left",
                          boxShadow: isActive
                            ? "0 0 0 2px rgba(0,229,255,0.25)"
                            : "none",
                          transition: "all 0.15s",
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            background: "#111",
                            borderRadius: 3,
                            flexShrink: 0,
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <PatternTile layers={pr.layers} size={36} />
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: T.txt,
                          }}
                        >
                          {pr.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div
                  style={{
                    fontSize: 11,
                    color: T.mut,
                    fontStyle: "italic",
                    padding: 8,
                    background: T.surf2,
                    borderRadius: 4,
                    marginBottom: 8,
                  }}
                >
                  No presets yet. Go back to Pattern Lab to create some.
                </div>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}

export function StageFinalize() {
  const { state, dispatch, T } = usePatternsOfPlace();
  const clusters = selectClusters(state);
  const bgColor = selectBgColor(state);
  const library = selectLibrary(state);
  const previewSide = selectPreviewSide(state);
  const { isDownloading, statusMessage } = selectExport(state);
  const reverseRings = selectReverseDecorations(state);
  const reverseTemplate = selectReverseTemplate(state);
  const { theme, activeReverseDecorationId } = state.ui;

  const { downloadJPEG, downloadSVG, getSvgPair } = useExportArtwork({
    clusters,
    bgColor,
    library,
    reverseRings,
    T,
    template: reverseTemplate,
  });

  const [qrUrl, setQrUrl] = useState("");
  const [qrExpiresAt, setQrExpiresAt] = useState("");
  const [qrStatus, setQrStatus] = useState("");
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState("");
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail.trim());

  const toggleTheme = () =>
    dispatch({ type: SET_THEME, theme: theme === "dark" ? "light" : "dark" });
  const goBack = () => dispatch({ type: SET_STAGE, stage: 3 });
  const restart = () => dispatch({ type: RESET });
  const isFront = previewSide === "front";

  const handleJPEG = async () => {
    dispatch({
      type: SET_EXPORT_STATUS,
      isDownloading: true,
      message: "Rendering…",
    });
    try {
      await downloadJPEG();
      dispatch({
        type: SET_EXPORT_STATUS,
        isDownloading: false,
        message: "Downloaded!",
      });
    } catch {
      dispatch({
        type: SET_EXPORT_STATUS,
        isDownloading: false,
        message: "Failed — try SVG",
      });
    }
    setTimeout(
      () =>
        dispatch({
          type: SET_EXPORT_STATUS,
          isDownloading: false,
          message: "",
        }),
      2500,
    );
  };

  const ensureQrUrl = async () => {
    if (qrUrl) return qrUrl;

    const { frontSvg, reverseSvg } = getSvgPair();
    const response = await fetch("/api/qr-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        redirectUrl: `${window.location.origin}/patterns-of-place`,
        metadata: {
          kind: "patterns-of-place-download",
          frontSvg,
          reverseSvg,
          createdAt: new Date().toISOString(),
        },
      }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload?.error || "Failed to generate QR");
    }

    const data = await response.json();
    setQrUrl(data.qrUrl || "");
    setQrExpiresAt(data.expiresAt || "");
    setQrStatus("QR generated. Scan once to download both sides.");
    return data.qrUrl || "";
  };

  const handleEmail = async () => {
    const normalizedEmail = recipientEmail.trim();

    if (!normalizedEmail) {
      setEmailStatus("Enter a recipient email first.");
      return;
    }

    if (!emailIsValid) {
      setEmailStatus("Enter a valid email address.");
      return;
    }

    setIsSendingEmail(true);
    setEmailStatus("Preparing secure link. You can also scan the QR below.");

    try {
      const qrLink = await ensureQrUrl();
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: recipientEmail.trim(),
          qrUrl: qrLink,
          expiresAt: qrExpiresAt || null,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "Failed to send email");
      }

      setEmailStatus(
        `Email sent to ${normalizedEmail}. You can also scan the QR below.`,
      );
    } catch (error) {
      setEmailStatus(
        error instanceof Error ? error.message : "Failed to send email.",
      );
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleGenerateQr = async () => {
    setIsGeneratingQr(true);
    setQrStatus("");

    try {
      const { frontSvg, reverseSvg } = getSvgPair();
      const response = await fetch("/api/qr-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          redirectUrl: `${window.location.origin}/patterns-of-place`,
          metadata: {
            kind: "patterns-of-place-download",
            frontSvg,
            reverseSvg,
            createdAt: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || "Failed to generate QR");
      }

      const data = await response.json();
      setQrUrl(data.qrUrl || "");
      setQrExpiresAt(data.expiresAt || "");
      setQrStatus("QR generated. Scan once to download both sides.");
    } catch (error) {
      setQrStatus(error?.message || "Failed to generate QR.");
    } finally {
      setIsGeneratingQr(false);
    }
  };

  const handleCopyLink = async () => {
    if (!qrUrl || !navigator?.clipboard) return;
    try {
      await navigator.clipboard.writeText(qrUrl);
      setQrStatus("Secure link copied.");
    } catch {
      setQrStatus("Could not copy link. You can copy it manually.");
    }
  };

  const panelCardStyle = {
    padding: 10,
    borderRadius: 12,
    border: `1px solid ${T.brd}`,
    background: T.surf1,
    marginBottom: 10,
  };

  return (
    <div
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        fontFamily: FONT,
        background: T.bg,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: "20px 24px",
          borderBottom: `1px solid ${T.brd}`,
          background: T.surf,
          flexShrink: 0,
        }}
      >
        <div style={{ flex: 1, textAlign: "center", minWidth: 0 }}>
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.3em",
              color: T.gold,
              textTransform: "uppercase",
              marginBottom: 2,
            }}
          >
            Step 3 / 3
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, color: T.txt }}>
            Finalize & Share
          </div>
        </div>
        <Button variant="secondary" small={false} T={T} onClick={toggleTheme}>
          {theme === "dark" ? "☀" : "◐"}
        </Button>
      </header>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          display: "flex",
          overflow: "hidden",
        }}
      >
        <aside
          style={{
            ...PANEL_STYLE,
            background: T.surf,
            borderRight: `1px solid ${T.brd}`,
          }}
        >
          <div style={panelCardStyle}>
            <Label T={T}>Preview Side</Label>
            <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
              {["front", "reverse"].map((side) => (
                <button
                  key={side}
                  onClick={() => dispatch({ type: SET_PREVIEW_SIDE, side })}
                  style={{
                    flex: 1,
                    padding: "7px 8px",
                    fontSize: 10,
                    fontWeight: 700,
                    fontFamily: FONT,
                    border: `1px solid ${previewSide === side ? T.gold : T.brd}`,
                    background: previewSide === side ? `${T.gold}14` : T.bg,
                    color: previewSide === side ? T.gold : T.mut,
                    cursor: "pointer",
                    borderRadius: 8,
                    minHeight: 36,
                    textTransform: "capitalize",
                  }}
                >
                  {side}
                </button>
              ))}
            </div>
          </div>

          {isFront ? (
            <div style={panelCardStyle}>
              <Label T={T}>Front Preview</Label>
              <div style={{ fontSize: 11, color: T.mut, marginTop: 4 }}>
                Switch to Reverse to customize the postcard back layout and
                rings.
              </div>
            </div>
          ) : (
            <div style={panelCardStyle}>
              <ReversePanel T={T} state={state} dispatch={dispatch} />
            </div>
          )}
        </aside>

        <main
          role="region"
          aria-label="Postcard preview"
          style={{
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            gap: 10,
            background: T.bg,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: T.mut,
            }}
          >
            {isFront ? "Front" : "Reverse"} Preview
          </div>

          <div
            style={{ borderRadius: 6, boxShadow: `0 16px 48px ${T.shadow}` }}
          >
            {isFront ? (
              <CardCanvas
                clusters={clusters}
                bgColor={bgColor}
                W={660}
                H={440}
                library={library}
              />
            ) : (
              <PostcardReverse
                T={T}
                bgColor={bgColor}
                W={660}
                H={440}
                reverseRings={reverseRings}
                library={library}
                activeRingId={activeReverseDecorationId}
                template={reverseTemplate}
                clusters={clusters}
              />
            )}
          </div>

          {!isFront && reverseRings.length > 0 && (
            <div style={{ fontSize: 10, color: T.mut, textAlign: "center" }}>
              Active ring:{" "}
              <span style={{ color: "#00e5ff", fontWeight: 700 }}>
                cyan dashed
              </span>
              {"  ·  "}
              Use Count / Radius / X / Y sliders to adjust.
            </div>
          )}
        </main>

        <aside
          style={{
            ...PANEL_STYLE,
            background: T.surf,
            borderLeft: `1px solid ${T.brd}`,
          }}
        >
          <div style={panelCardStyle}>
            <Label T={T}>Download</Label>
            <div
              style={{
                fontSize: 10,
                color: T.mut,
                marginTop: 2,
                marginBottom: 8,
              }}
            >
              Export your final postcard front and back.
            </div>
            <Button T={T} onClick={handleJPEG} disabled={isDownloading}>
              {isDownloading
                ? statusMessage || "Rendering..."
                : "↓ Download PNG"}
            </Button>
          </div>

          <div style={panelCardStyle}>
            <Label T={T}>Secure QR Link</Label>
            <div
              style={{
                fontSize: 10,
                color: T.mut,
                marginTop: 2,
                marginBottom: 8,
              }}
            >
              Generate a one-time link for download and sharing.
            </div>
            <Button
              variant="blue"
              T={T}
              onClick={handleGenerateQr}
              disabled={isGeneratingQr}
            >
              {isGeneratingQr ? "Generating..." : "Generate QR Link"}
            </Button>

            {qrUrl && (
              <div
                style={{
                  marginTop: 10,
                  padding: 10,
                  borderRadius: 8,
                  border: `1px solid ${T.brd}`,
                  background: T.surf2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <QRCodeCanvas
                  value={qrUrl}
                  size={140}
                  level="H"
                  includeMargin
                />
                <div
                  style={{ fontSize: 10, color: T.mut, textAlign: "center" }}
                >
                  Scan to open one-time download page.
                </div>
                <Button
                  variant="secondary"
                  small
                  T={T}
                  onClick={handleCopyLink}
                >
                  Copy Link
                </Button>
                {qrExpiresAt && (
                  <div
                    style={{ fontSize: 10, color: T.dim, textAlign: "center" }}
                  >
                    Expires: {new Date(qrExpiresAt).toLocaleString()}
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={panelCardStyle}>
            <Label T={T}>Send via Email</Label>
            <div
              style={{
                fontSize: 10,
                color: T.mut,
                marginTop: 2,
                marginBottom: 8,
              }}
            >
              We include the secure QR download link in the email.
            </div>
            <input
              value={recipientEmail}
              onChange={(event) => {
                setRecipientEmail(event.target.value);
                if (emailStatus) setEmailStatus("");
              }}
              placeholder="Recipient email"
              type="email"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px 12px",
                borderRadius: 8,
                border: `1px solid ${T.brd}`,
                background: T.bg,
                color: T.txt,
                fontFamily: FONT,
                fontSize: 12,
                outline: "none",
                marginBottom: 8,
              }}
            />
            <Button
              variant="blue"
              T={T}
              onClick={handleEmail}
              disabled={isSendingEmail || !recipientEmail.trim()}
            >
              {isSendingEmail ? "Sending..." : "✉ Send Email"}
            </Button>
            {!!recipientEmail.trim() && !emailIsValid && (
              <div style={{ fontSize: 10, color: "#e05a5a", marginTop: 6 }}>
                Enter a valid email address.
              </div>
            )}
          </div>

          {(statusMessage || qrStatus || emailStatus) && (
            <div
              role="status"
              aria-live="polite"
              style={{
                marginTop: "auto",
                fontSize: 11,
                fontWeight: 600,
                textAlign: "center",
                color:
                  statusMessage.toLowerCase().includes("fail") ||
                  qrStatus.toLowerCase().includes("fail") ||
                  emailStatus.toLowerCase().includes("fail")
                    ? "#e05a5a"
                    : "#4caf50",
              }}
            >
              {emailStatus || qrStatus || statusMessage}
            </div>
          )}
        </aside>
      </div>

      <div
        style={{
          position: "fixed",
          left: "50%",
          bottom: 20,
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: 12,
          borderRadius: 999,
          background: T.surf,
          border: `1px solid ${T.brd}`,
          boxShadow: `0 12px 32px ${T.shadow}`,
          zIndex: 150,
        }}
      >
        <Button variant="secondary" small={false} T={T} onClick={goBack}>
          ← Back
        </Button>
        <Button variant="secondary" small={false} T={T} onClick={restart}>
          Start Over
        </Button>
      </div>
    </div>
  );
}
