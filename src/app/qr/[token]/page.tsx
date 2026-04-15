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

function downloadSvgFile(fileName: string, svgText: string) {
  const blob = new Blob([svgText], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function QrTokenPage() {
  const params = useParams<{ token: string }>();
  const token = useMemo(() => String(params?.token || ""), [params]);

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<ValidationResponse | null>(null);

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
              onClick={() =>
                downloadSvgFile(
                  "patterns-of-place-front.svg",
                  payload.frontSvg!,
                )
              }
              className="px-4 py-2 rounded bg-black text-white hover:opacity-90"
            >
              Download Front (SVG)
            </button>
            <button
              onClick={() =>
                downloadSvgFile(
                  "patterns-of-place-reverse.svg",
                  payload.reverseSvg!,
                )
              }
              className="px-4 py-2 rounded bg-black text-white hover:opacity-90"
            >
              Download Reverse (SVG)
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
