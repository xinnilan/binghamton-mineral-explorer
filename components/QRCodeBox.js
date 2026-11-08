"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { siteUrl } from "@/lib/config";

// QR code that links to a specimen's page, ready to print and put next to the rock.
export default function QRCodeBox({ specimen }) {
  const [dataUrl, setDataUrl] = useState(null);
  const link = `${siteUrl()}/specimens/${specimen.id}`;

  useEffect(() => {
    QRCode.toDataURL(link, { width: 600, margin: 2 }).then(setDataUrl);
  }, [link]);

  if (!dataUrl) return null;

  const fileName = `qr-${specimen.catalog_number || specimen.id}.png`;

  return (
    <div className="qr-box">
      <img src={dataUrl} alt={`QR code linking to ${specimen.name}`} width={180} height={180} />
      <div>
        <p className="muted small">Links to: {link}</p>
        <a href={dataUrl} download={fileName} className="button">Download QR code</a>
      </div>
    </div>
  );
}
