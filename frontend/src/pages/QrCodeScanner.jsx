import React from "react";
import { QrReader } from "react-qr-reader";

export default function QrCodeScanner({ onScan }) {
  const handleScanResult = (result, error) => {
    if (!!result) {
      onScan(result?.text);
    }
    if (!!error) {
      // You can handle or ignore errors here
    }
  };

  return (
    <div style={{ width: "300px", marginBottom: "20px" }}>
      <QrReader
        constraints={{ facingMode: "environment" }}
        scanDelay={300}
        onResult={handleScanResult}
        style={{ width: "100%" }}
      />
    </div>
  );
}
