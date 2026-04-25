"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Crimson_Pro, Outfit } from "next/font/google";
import logo from "@/assets/Logo.png";

const crimsonPro = Crimson_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

type ValidationResponse = {
  status?: string;
  error?: string;
  message?: string;
  redirectUrl?: string;
  payload?: {
    kind?: string;
    frontPng?: string;
    frontSvg?: string;
    reverseSvg?: string;
  };
};

const EXPORT_W = 1800;
const EXPORT_H = 1200;

function triggerDownload(fileName: string, href: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => {
    if (href.startsWith("blob:")) URL.revokeObjectURL(href);
  }, 1000);
}

function svgToPngDataUrl(svgText: string, width: number, height: number) {
  return new Promise<string>((resolve, reject) => {
    const img = new Image();
    const dataUri =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgText)));

    img.onload = () => {
      const dpr = window.devicePixelRatio || 1;
      const canvas = document.createElement("canvas");
      canvas.width = width * dpr;
      canvas.height = height * dpr;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context unavailable"));
        return;
      }

      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/png", 0.95));
    };

    img.onerror = () => reject(new Error("Failed to render SVG"));
    img.src = dataUri;
  });
}

export default function QrTokenPage() {
  const params = useParams<{ token: string }>();
  const token = useMemo(() => String(params?.token || ""), [params]);

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<ValidationResponse | null>(null);
  const logoSrc = typeof logo === "string" ? logo : logo?.src;
  const [isMobile, setIsMobile] = useState(false);
  const [downloadingSide, setDownloadingSide] = useState<
    "front" | "reverse" | null
  >(null);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)");
    const syncMobile = () => setIsMobile(media.matches);
    syncMobile();
    media.addEventListener("change", syncMobile);
    return () => media.removeEventListener("change", syncMobile);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function validate() {
      if (!token) return;
      setLoading(true);
      try {
        const response = await fetch(`/api/qr/${encodeURIComponent(token)}`, {
          cache: "no-store",
        });
        const data = (await response.json()) as ValidationResponse;
        if (isMounted) setResult(data);
      } catch {
        if (isMounted) {
          setResult({
            status: "error",
            error: "Could not validate QR code",
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    validate();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const payload = result?.payload;
  const hasDownloadPayload =
    payload?.kind === "patterns-of-place-download" &&
    (typeof payload.frontPng === "string" ||
      typeof payload.frontSvg === "string") &&
    typeof payload.reverseSvg === "string";

  const loadingBg = isMobile
    ? "radial-gradient(1100px 800px at 0% 0%, rgba(127, 0, 0, 0.7), transparent 35%), radial-gradient(900px 700px at 100% 100%,rgba(176, 136, 51, 0.7), transparent 35%), linear-gradient(180deg, #070707 0%, #1a0202 55%, #120101 100%)"
    : "radial-gradient(1100px 800px at 0% 0%, rgba(127, 0, 0, 1), transparent 55%), radial-gradient(900px 700px at 100% 100%, rgba(176, 136, 51, 1), transparent 60%), linear-gradient(180deg, #070707 0%, #1a0202 55%, #120101 100%)";

  const successBg = isMobile
    ? "radial-gradient(1100px 800px at 0% 0%, rgba(127, 0, 0, 0.7), transparent 45%), radial-gradient(900px 700px at 100% 100%,rgba(176, 136, 51, 0.7), transparent 45%), linear-gradient(180deg, #070707 0%, #1a0202 55%, #120101 100%)"
    : "radial-gradient(1100px 800px at 0% 0%, rgba(127, 0, 0, 1), transparent 55%), radial-gradient(900px 700px at 100% 100%, rgba(176, 136, 51, 1), transparent 60%), linear-gradient(180deg, #070707 0%, #1a0202 55%, #120101 100%)";

  const downloadPng = async (side: "front" | "reverse") => {
    if (!hasDownloadPayload) return;
    setDownloadingSide(side);

    if (side === "front" && typeof payload.frontPng === "string") {
      try {
        triggerDownload("patterns-of-place-front.png", payload.frontPng);
      } finally {
        setDownloadingSide(null);
      }
      return;
    }

    const svgText = side === "front" ? payload.frontSvg! : payload.reverseSvg!;
    try {
      const pngUrl = await svgToPngDataUrl(svgText, EXPORT_W, EXPORT_H);
      triggerDownload(`patterns-of-place-${side}.png`, pngUrl);
    } catch {
      // Fallback keeps redemption useful even if PNG conversion fails in browser
      const fallbackBlob = new Blob([svgText], { type: "image/svg+xml" });
      const fallbackUrl = URL.createObjectURL(fallbackBlob);
      triggerDownload(`patterns-of-place-${side}.svg`, fallbackUrl);
    } finally {
      setDownloadingSide(null);
    }
  };

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          color: "#f3dfb7",
          fontFamily: outfit.style.fontFamily,
          background: loadingBg,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: 30, fontWeight: 700, margin: 0 }}>
            Validating QR code...
          </h1>
        </div>
      </main>
    );
  }

  if (!result || result.status !== "success") {
    return (
      <main
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          color: "#f3dfb7",
          fontFamily: outfit.style.fontFamily,
          background: loadingBg,
        }}
      >
        <div
          style={{
            width: "min(92vw, 460px)",
            borderRadius: 18,
            border: "1px solid rgba(227,172,32,0.35)",
            padding: "22px 20px",
            background: "rgba(5,6,10,0.78)",
            boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
          }}
        >
          <h1
            style={{
              margin: "0 0 10px",
              fontSize: "clamp(30px, 7vw, 44px)",
              color: "#e3ac20",
              lineHeight: 1,
              letterSpacing: "-0.01em",
              fontWeight: 600,
              fontFamily: crimsonPro.style.fontFamily,
            }}
          >
            QR code unavailable
          </h1>
          <p
            style={{ margin: 0, fontSize: 15, color: "rgba(243,223,183,0.9)" }}
          >
            {result?.error ||
              "This QR code is invalid, expired, or already used."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px 36px",
        position: "relative",
        overflow: "hidden",
        color: "#f3dfb7",
        fontFamily: outfit.style.fontFamily,
        background: successBg,
      }}
    >
      <div
        style={{
          width: "min(92vw, 380px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          textAlign: "center",
          marginTop: -80,
        }}
      >
        <h1
          style={{
            margin: 0,
            marginBottom: 20,
            fontSize: "clamp(22px, 5vw, 38px)",
            color: "#e3ac20",
            lineHeight: 1,
            letterSpacing: "-0.01em",
            fontWeight: 600,
            fontFamily: crimsonPro.style.fontFamily,
          }}
        >
          Your postcard is ready.
        </h1>

        {hasDownloadPayload ? (
          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <button
              onClick={() => downloadPng("front")}
              disabled={downloadingSide !== null}
              style={{
                width: "80%",
                minHeight: 54,
                borderRadius: 999,
                border: "1px solid #b08700",
                background: "#050a13",
                color: "#eedebe",
                fontSize: "20px",
                fontWeight: 700,
                letterSpacing: "0.02em",
                textTransform: "uppercase",
                cursor: downloadingSide ? "not-allowed" : "pointer",
              }}
            >
              {downloadingSide === "front" ? "Preparing..." : "Download Front"}
            </button>
            <button
              onClick={() => downloadPng("reverse")}
              disabled={downloadingSide !== null}
              style={{
                width: "80%",
                minHeight: 54,
                borderRadius: 999,
                border: "1px solid #b08700",
                background: "#050a13",
                color: "#eedebe",
                fontSize: "20px",
                fontWeight: 700,
                letterSpacing: "0.02em",
                textTransform: "uppercase",
                cursor: downloadingSide ? "not-allowed" : "pointer",
              }}
            >
              {downloadingSide === "reverse"
                ? "Preparing..."
                : "Download Reverse"}
            </button>
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: 15, color: "#DAC698" }}>
            QR validated, but this token does not contain postcard artwork
            payload.
          </p>
        )}

        <p style={{ margin: 0, fontSize: 12, color: "#DAC698" }}>
          The QR code is valid and has been redeemed.
        </p>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 56,
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
        }}
      >
        <img
          src={logoSrc}
          alt="Patterns of Place"
          style={{
            width: "clamp(80px, 30vw, 150px)",
            height: "auto",
            display: "block",
            filter: "drop-shadow(0 0 14px rgba(227,172,32,0.32))",
          }}
        />
      </div>
    </main>
  );
}
