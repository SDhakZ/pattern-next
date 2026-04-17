import { useState, useCallback } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { usePatternsOfPlace } from "../../app/PatternsOfPlaceProvider.jsx";
import {
  SET_STAGE,
  SET_THEME,
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
          ← Back to Studio
        </Button>
        <Button variant="secondary" small={false} T={T} onClick={restart}>
          Start Over
        </Button>
      </div>
    </div>
  );
}
