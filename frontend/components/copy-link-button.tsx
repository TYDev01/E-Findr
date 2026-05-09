"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center justify-center gap-2 rounded-2xl border border-ink/10 px-4 py-3 text-sm font-semibold text-ink"
    >
      {copied ? <Check className="h-4 w-4 text-fern" /> : <Copy className="h-4 w-4" />}
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}
