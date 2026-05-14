"use client";

import QRCode from "qrcode";
import { QrCode } from "lucide-react";

export function DownloadQrButton({ url, eventTitle }: { url: string; eventTitle: string }) {
  async function handleDownload() {
    const dataUrl = await QRCode.toDataURL(url, { width: 512, margin: 2 });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${eventTitle.replace(/\s+/g, "-").toLowerCase()}-qr.png`;
    a.click();
  }

  return (
    <button
      onClick={handleDownload}
      className="flex items-center justify-center gap-2 rounded-2xl border border-ink/10 px-4 py-3 text-sm font-semibold text-ink"
    >
      <QrCode className="h-4 w-4" /> Download QR
    </button>
  );
}
