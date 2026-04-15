import Link from "next/link";
import PatternsOfPlaceClient from "./patterns-of-place/PatternsOfPlaceClient";

export default function Home() {
  return (
    <main>
      <PatternsOfPlaceClient />
      <div style={{ position: "fixed", left: 16, bottom: 16, zIndex: 9999 }}>
        <Link
          href="/qr-generator"
          style={{
            background: "rgba(0,0,0,0.72)",
            color: "#fff",
            padding: "8px 12px",
            borderRadius: 10,
            fontSize: 12,
            textDecoration: "none",
          }}
        >
          Open QR Demo
        </Link>
      </div>
    </main>
  );
}
