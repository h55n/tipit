"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchAllTips, subscribeTips, TipEvent } from "../lib/events";
import { shortenAddress, formatEth } from "../lib/contract";

interface Props {
  refreshTrigger: number; // increment to force a refresh
}

export default function SupporterWall({ refreshTrigger }: Props) {
  const [tips, setTips] = useState<TipEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const newTipKeys = useRef<Set<string>>(new Set());

  // ── Load all historical tips ──────────────────────────────────────────────
  const loadTips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const all = await fetchAllTips();
      setTips(all);
    } catch (err: unknown) {
      const msg = (err as Error)?.message || "Failed to load tips";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTips();
  }, [loadTips, refreshTrigger]);

  // ── Subscribe to live incoming tips ───────────────────────────────────────
  useEffect(() => {
    const unsub = subscribeTips((tip) => {
      const key = tip.txHash;
      if (newTipKeys.current.has(key)) return; // deduplicate
      newTipKeys.current.add(key);

      setTips((prev) => {
        // Avoid duplicating tips already fetched by queryFilter
        if (prev.some((t) => t.txHash === key)) return prev;
        return [tip, ...prev];
      });
    });

    return unsub;
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────
  function formatDate(ts: number): string {
    const d = new Date(ts * 1000);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <section>
      {/* Section header */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: "var(--space-md)",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 className="headline-md">Supporter Wall</h2>
          <p className="body-md" style={{ color: "var(--color-primary-70)", marginTop: 6 }}>
            Every tip recorded on-chain — transparent, permanent, no middleman.
          </p>
        </div>
        {!loading && tips.length > 0 && (
          <span className="chip">
            {tips.length} {tips.length === 1 ? "supporter" : "supporters"}
          </span>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "32px 0",
            color: "var(--color-primary-70)",
          }}
        >
          <span className="spinner" />
          <span className="body-md">Reading on-chain events…</span>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div
          className="card"
          style={{ borderColor: "#fca5a5", padding: "20px 16px" }}
        >
          <p className="body-sm" style={{ color: "var(--color-error)" }}>
            Couldn&apos;t load tips: {error}
          </p>
          <button
            className="btn-secondary"
            onClick={loadTips}
            style={{ marginTop: 12 }}
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && tips.length === 0 && (
        <div
          style={{
            padding: "64px 0",
            textAlign: "center",
            color: "var(--color-primary-70)",
          }}
        >
          <p style={{ fontSize: 40, marginBottom: 16 }}>☕</p>
          <p className="headline-sm" style={{ color: "var(--color-primary)", marginBottom: 8 }}>
            No tips yet
          </p>
          <p className="body-md">Be the first to show your support!</p>
        </div>
      )}

      {/* Tip cards */}
      {!loading && !error && tips.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {tips.map((tip, i) => (
            <TipCard
              key={tip.txHash}
              tip={tip}
              isNew={i === 0 && newTipKeys.current.has(tip.txHash)}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ── Individual tip card ───────────────────────────────────────────────────────
function TipCard({
  tip,
  isNew,
  formatDate,
}: {
  tip: TipEvent;
  isNew: boolean;
  formatDate: (ts: number) => string;
}) {
  return (
    <div
      className={`card ${isNew ? "tip-card-enter" : ""}`}
      style={{ display: "flex", flexDirection: "column", gap: 10 }}
    >
      {/* Top row: address + amount + date */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Avatar placeholder */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: `hsl(${parseInt(tip.sender.slice(2, 8), 16) % 360}, 40%, 70%)`,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              color: "white",
              fontWeight: 700,
            }}
          >
            {tip.sender.slice(2, 4).toUpperCase()}
          </div>
          <div>
            <a
              href={`https://sepolia.etherscan.io/address/${tip.sender}`}
              target="_blank"
              rel="noopener noreferrer"
              className="label-md"
              style={{
                color: "var(--color-primary)",
                textDecoration: "none",
                fontFamily: "var(--font-label)",
                fontSize: 12,
                letterSpacing: "0.04em",
              }}
            >
              {shortenAddress(tip.sender)}
            </a>
            <p className="caption" style={{ marginTop: 1 }}>
              {formatDate(tip.timestamp)}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 17,
              fontWeight: 700,
              color: "var(--color-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            {formatEth(tip.amount)}
          </span>
          <a
            href={`https://sepolia.etherscan.io/tx/${tip.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="caption"
            style={{
              color: "var(--color-primary-70)",
              textDecoration: "none",
              opacity: 0.7,
            }}
            title="View transaction"
          >
            ↗
          </a>
        </div>
      </div>

      {/* Message */}
      {tip.message && (
        <p
          className="body-md"
          style={{
            color: "var(--color-secondary)",
            paddingLeft: 42, // aligns with text after avatar
            fontStyle: "italic",
          }}
        >
          &ldquo;{tip.message}&rdquo;
        </p>
      )}
    </div>
  );
}
