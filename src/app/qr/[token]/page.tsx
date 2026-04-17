"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type ValidationResponse = {
  status?: string;
  error?: string;
  message?: string;
  redirectUrl?: string;
  payload?: {
    kind?: string;
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
  const [downloadingSide, setDownloadingSide] = useState<
    "front" | "reverse" | null
  >(null);

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
    typeof payload.frontSvg === "string" &&
    typeof payload.reverseSvg === "string";

  const downloadPng = async (side: "front" | "reverse") => {
    if (!hasDownloadPayload) return;
    const svgText = side === "front" ? payload.frontSvg! : payload.reverseSvg!;
    setDownloadingSide(side);
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
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Validating QR code...</h1>
        </div>
      </main>
    );
  }

  if (!result || result.status !== "success") {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-xl border border-gray-200 bg-white p-6">
          <h1 className="text-2xl font-semibold mb-2">QR code unavailable</h1>
          <p className="text-sm text-gray-700">
            {result?.error ||
              "This QR code is invalid, expired, or already used."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="max-w-lg w-full rounded-xl border border-gray-200 bg-white p-6">
        <h1 className="text-2xl font-semibold mb-2">Your postcard is ready</h1>
        <p className="text-sm text-gray-600 mb-5">
          This QR code is valid and has been redeemed. Download both sides
          below.
        </p>

        {hasDownloadPayload ? (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => downloadPng("front")}
              disabled={downloadingSide !== null}
              className="px-4 py-2 rounded bg-black text-white hover:opacity-90"
            >
              {downloadingSide === "front"
                ? "Preparing..."
                : "Download Front (PNG)"}
            </button>
            <button
              onClick={() => downloadPng("reverse")}
              disabled={downloadingSide !== null}
              className="px-4 py-2 rounded bg-black text-white hover:opacity-90"
            >
              {downloadingSide === "reverse"
                ? "Preparing..."
                : "Download Reverse (PNG)"}
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-700">
            QR validated, but this token does not contain postcard artwork
            payload.
          </p>
        )}
      </div>
    </main>
  );
}
