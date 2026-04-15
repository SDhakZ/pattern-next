"use client";

import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function QRGenerator() {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateQR = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/qr-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          redirectUrl: "https://example.com/success",
          metadata: { campaign: "demo" },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate QR code");
      }

      const data = await response.json();
      setQrUrl(data.qrUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-4">
      <h1 className="text-3xl font-bold">QR Code Generator</h1>

      <button
        onClick={handleGenerateQR}
        disabled={loading}
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate One-Time QR Code"}
      </button>

      {error && <div className="text-red-600">Error: {error}</div>}

      {qrUrl && (
        <div className="flex flex-col items-center gap-4">
          <QRCodeCanvas
            value={qrUrl}
            size={256}
            level="H"
            includeMargin={true}
          />
          <p className="text-sm text-gray-600">
            Scan this QR code. It can only be used once!
          </p>
          <p className="text-xs text-gray-500 word-break: break-all">{qrUrl}</p>
        </div>
      )}
    </div>
  );
}
