import { useState } from "react";
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
  selectReverseTemplate,
} from "../../app/selectors.js";
import { Button } from "../shared/Button.jsx";
import { CardCanvas } from "../shared/CardCanvas.jsx";
import { PostcardReverse } from "./PostcardReverse.jsx";
import { useExportArtwork } from "../../hooks/useExportArtwork.js";
import { FONT } from "../../data/constants/themes.js";
import bgImage from "../../../../assets/bg.png";

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

  const { downloadJPEG, getSvgPair } = useExportArtwork({
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
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const goBack = () => dispatch({ type: SET_STAGE, stage: 2 });
  const restart = () => dispatch({ type: RESET });
  const isFront = previewSide === "front";

  const handleJPEG = async () => {
    dispatch({
      type: SET_EXPORT_STATUS,
      isDownloading: true,
      message: "Rendering...",
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
        message: "Failed - try again",
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

  const ensureQrUrl = async (forceRefresh = false) => {
    if (qrUrl && !forceRefresh) return qrUrl;

    const { frontSvg, reverseSvg } = await getSvgPair();
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

  const handleGenerateQr = async (forceRefresh = false) => {
    setIsGeneratingQr(true);
    setQrStatus("");
    try {
      await ensureQrUrl(forceRefresh);
    } catch (error) {
      setQrStatus(error?.message || "Failed to generate QR.");
    } finally {
      setIsGeneratingQr(false);
    }
  };

  const handleOpenQrModal = async () => {
    setIsQrModalOpen(true);
    if (!qrUrl) {
      await handleGenerateQr(false);
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

  return (
    <div
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        fontFamily: FONT,
        backgroundImage: `url(${bgImage.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          fontSize: 42,
          fontWeight: 700,
          color: "#f0bc46",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          letterSpacing: "0em",
          fontFamily:
            "'Cormorant Garamond', 'Palatino Linotype', 'Times New Roman', serif",
          lineHeight: 1,
          textAlign: "center",
          marginTop: 80,
        }}
      >
        Collect Your Keepsake
      </div>

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
          gap: 12,
          padding: "18px 24px 160px",
          background:
            "radial-gradient(circle at 50% 30%, rgba(146, 47, 18, 0.28), rgba(0,0,0,0.2) 42%, rgba(0,0,0,0.82) 100%)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: 10,
            borderRadius: 8,
          }}
        >
          {["front", "reverse"].map((side) => (
            <button
              key={side}
              onClick={() => dispatch({ type: SET_PREVIEW_SIDE, side })}
              style={{
                padding: "7px 12px",
                fontSize: 14,
                fontWeight: 700,
                fontFamily: FONT,
                border: `1px solid ${previewSide === side ? T.gold : T.brd}`,
                background:
                  previewSide === side ? `${T.gold}14` : "rgba(0, 0, 0, 0.74)",
                color: previewSide === side ? T.gold : T.mut,
                cursor: "pointer",
                borderRadius: 8,
                minHeight: 36,
                minWidth: 96,
                textTransform: "uppercase",
              }}
            >
              {side}
            </button>
          ))}
        </div>

        <div
          style={{
            borderRadius: 6,
            boxShadow: `0 16px 48px ${T.shadow}`,
          }}
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

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: 10,

            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Button
            T={T}
            onClick={handleJPEG}
            disabled={isDownloading}
            style={{ minWidth: 160, borderRadius: 8 }}
          >
            {isDownloading ? statusMessage || "Rendering..." : "Download PNG"}
          </Button>
          <Button
            variant="blue"
            T={T}
            onClick={handleOpenQrModal}
            disabled={isGeneratingQr}
            style={{ minWidth: 160, borderRadius: 8 }}
          >
            {isGeneratingQr ? "Generating..." : "Generate QR"}
          </Button>
        </div>
      </main>

      {isQrModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 220,
            padding: 20,
          }}
          onClick={() => setIsQrModalOpen(false)}
        >
          <div
            style={{
              width: "min(420px, 100%)",
              padding: 16,
              borderRadius: 14,
              border: `1px solid ${T.brd}`,
              background: "rgba(12, 12, 12, 0.96)",
              boxShadow: `0 24px 80px ${T.shadow}`,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              alignItems: "center",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: T.txt,
              }}
            >
              Secure QR Link
            </div>
            <div
              style={{
                fontSize: 11,
                color: T.mut,
                textAlign: "center",
                lineHeight: 1.5,
              }}
            >
              Scan to open the one-time download page for both postcard sides.
            </div>

            {qrUrl ? (
              <QRCodeCanvas value={qrUrl} size={180} level="H" includeMargin />
            ) : (
              <div
                style={{
                  width: 180,
                  height: 180,
                  borderRadius: 10,
                  border: `1px dashed ${T.brd}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: T.mut,
                  fontSize: 11,
                  textAlign: "center",
                  padding: 12,
                }}
              >
                {isGeneratingQr ? "Generating QR..." : "QR unavailable"}
              </div>
            )}

            {qrExpiresAt && (
              <div style={{ fontSize: 10, color: T.dim, textAlign: "center" }}>
                Expires: {new Date(qrExpiresAt).toLocaleString()}
              </div>
            )}

            {qrStatus && (
              <div
                style={{
                  fontSize: 11,
                  color: qrStatus.toLowerCase().includes("fail")
                    ? "#e05a5a"
                    : "#4caf50",
                  textAlign: "center",
                }}
              >
                {qrStatus}
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: 8,
                width: "100%",
                justifyContent: "center",
                flexWrap: "wrap",
                marginTop: 4,
              }}
            >
              <Button
                variant="secondary"
                small
                T={T}
                onClick={handleCopyLink}
                disabled={!qrUrl}
              >
                Copy Link
              </Button>
              <Button
                variant="blue"
                small
                T={T}
                onClick={() => handleGenerateQr(true)}
                disabled={isGeneratingQr}
              >
                {isGeneratingQr ? "Regenerating..." : "Regenerate"}
              </Button>
              <Button small T={T} onClick={() => setIsQrModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          position: "fixed",
          left: "50%",
          bottom: 60,
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
          style={{ minWidth: 132, minHeight: 44 }}
        >
          Back
        </Button>
        <Button
          variant="nav"
          small={false}
          T={T}
          onClick={restart}
          style={{ minWidth: 132, minHeight: 44, background: "#2F200B" }}
        >
          Start Over
        </Button>
      </div>
    </div>
  );
}
