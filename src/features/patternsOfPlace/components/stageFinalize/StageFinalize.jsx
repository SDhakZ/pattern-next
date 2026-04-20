import { useState, useCallback } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { usePatternsOfPlace } from "../../app/PatternsOfPlaceProvider.jsx";
import {
  SET_STAGE,
  SET_PREVIEW_SIDE,
  RESET,
  SET_EXPORT_STATUS,
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
import { Label } from "../shared/Label.jsx";
import { CardCanvas } from "../shared/CardCanvas.jsx";
import { PostcardReverse } from "./PostcardReverse.jsx";
import { useExportArtwork } from "../../hooks/useExportArtwork.js";
import { FONT } from "../../data/constants/themes.js";
import bgImage from "../../../../assets/bg.png";

const PANEL_STYLE = {
  width: 380,
  flexShrink: 0,
  height: "100%",
  minHeight: 0,
  overflowY: "auto",
  overscrollBehavior: "contain",
  padding: "24px 20px",
  display: "flex",
  flexDirection: "column",
};

export function StageFinalize() {
  const { state, dispatch, T } = usePatternsOfPlace();
  const clusters = selectClusters(state);
  const bgColor = selectBgColor(state);
  const library = selectLibrary(state);
  const previewSide = selectPreviewSide(state);
  const { isDownloading, statusMessage } = selectExport(state);
  const reverseRings = selectReverseDecorations(state);
  const reverseTemplate = selectReverseTemplate(state);
  const { activeReverseDecorationId } = state.ui;

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

  const goBack = () => dispatch({ type: SET_STAGE, stage: 2 });
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
    background: "rgba(12, 12, 12, 0.88)",
    marginBottom: 10,
  };

  return (
    <div
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        fontFamily: FONT,
        backgroundImage: `
          url(${bgImage.src})
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
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
          background:
            "linear-gradient(180deg, rgba(6,6,6,0.98) 0%, rgba(11,8,8,0.96) 100%)",
          flexShrink: 0,
        }}
      >
        <div style={{ flex: 1, textAlign: "center", minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: T.txt }}>
            Finalize & Share
          </div>
        </div>
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
            background:
              "linear-gradient(180deg, rgba(9,9,9,0.95) 0%, rgba(12,6,4,0.9) 100%)",
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
        </aside>
        <main
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
            background:
              "radial-gradient(circle at 50% 30%, rgba(146, 47, 18, 0.28), rgba(0,0,0,0.2) 42%, rgba(0,0,0,0.82) 100%)",
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
                reverseRings={[]}
                library={library}
                activeRingId={activeReverseDecorationId}
                template={reverseTemplate}
                clusters={clusters}
              />
            )}
          </div>
        </main>
        <aside
          style={{
            ...PANEL_STYLE,
            background:
              "linear-gradient(180deg, rgba(9,9,9,0.95) 0%, rgba(12,6,4,0.9) 100%)",
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

          {(statusMessage || qrStatus) && (
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
                  qrStatus.toLowerCase().includes("fail")
                    ? "#e05a5a"
                    : "#4caf50",
              }}
            >
              {qrStatus || statusMessage}
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
          background: "rgba(0, 0, 0, 0.82)",
          border: "1px solid rgba(184,137,18,0.45)",
          boxShadow: "0 12px 32px rgba(0,0,0,0.55)",
          zIndex: 150,
        }}
      >
        <Button
          variant="nav"
          small={false}
          T={T}
          onClick={goBack}
          style={{ minWidth: 144, minHeight: 48 }}
        >
          Back
        </Button>
        <Button
          variant="nav"
          small={false}
          T={T}
          onClick={restart}
          style={{ minWidth: 144, minHeight: 48 }}
        >
          Start Over
        </Button>
      </div>
    </div>
  );
}
