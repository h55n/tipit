"use client";

export type TxState =
  | { status: "idle" }
  | { status: "pending"; hash: string }
  | { status: "confirmed"; hash: string }
  | { status: "failed"; message: string };

interface Props {
  tx: TxState;
}

const ETHERSCAN = "https://sepolia.etherscan.io/tx";

export default function TxStatus({ tx }: Props) {
  if (tx.status === "idle") return null;

  if (tx.status === "pending") {
    return (
      <div
        className="card"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 16px",
        }}
      >
        <span className="spinner" />
        <div>
          <p className="body-sm" style={{ fontWeight: 600 }}>
            Transaction pending…
          </p>
          <a
            href={`${ETHERSCAN}/${tx.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 11,
              color: "var(--color-primary-70)",
              textDecoration: "underline",
              fontFamily: "var(--font-label)",
              letterSpacing: "0.04em",
            }}
          >
            View on Etherscan ↗
          </a>
        </div>
      </div>
    );
  }

  if (tx.status === "confirmed") {
    return (
      <div
        className="card"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "14px 16px",
          borderColor: "#6ee7b7",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>✓</span>
          <p className="body-sm" style={{ fontWeight: 600, color: "#065f46" }}>
            Tip confirmed! It will appear on the wall momentarily.
          </p>
        </div>
        <a
          href={`${ETHERSCAN}/${tx.hash}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 11,
            color: "#065f46",
            textDecoration: "underline",
            fontFamily: "var(--font-label)",
            letterSpacing: "0.04em",
            whiteSpace: "nowrap",
          }}
        >
          Etherscan ↗
        </a>
      </div>
    );
  }

  if (tx.status === "failed") {
    return (
      <div
        className="card"
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          padding: "14px 16px",
          borderColor: "#fca5a5",
        }}
      >
        <span style={{ fontSize: 16, flexShrink: 0 }}>✕</span>
        <p
          className="body-sm"
          style={{ color: "var(--color-error)", fontWeight: 600 }}
        >
          {tx.message}
        </p>
      </div>
    );
  }

  return null;
}
