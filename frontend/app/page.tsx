"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import SupporterWall from "../components/SupporterWall";

// Lazy-load wallet components (they use window.ethereum)
const WalletConnect = dynamic(() => import("../components/WalletConnect"), {
  ssr: false,
});
const TipForm = dynamic(() => import("../components/TipForm"), { ssr: false });

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  const handleConnect = useCallback((addr: string) => {
    setWalletAddress(addr);
  }, []);

  const handleDisconnect = useCallback(() => {
    setWalletAddress(null);
  }, []);

  const handleTipConfirmed = useCallback(() => {
    // Increment trigger so SupporterWall re-fetches events
    setRefreshCount((c) => c + 1);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-neutral)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <header
        style={{
          padding: "var(--space-sm) var(--space-md)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--color-tertiary)",
          position: "sticky",
          top: 0,
          background: "var(--color-neutral)",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>☕</span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: "-0.03em",
              color: "var(--color-primary)",
            }}
          >
            Tip Jar
          </span>
          <span className="chip" style={{ marginLeft: 4 }}>
            Sepolia
          </span>
        </div>
        <WalletConnect onConnect={handleConnect} onDisconnect={handleDisconnect} />
      </header>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <main
        style={{
          maxWidth: 760,
          width: "100%",
          margin: "0 auto",
          padding: "var(--space-xl) var(--space-md)",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-xl)",
        }}
      >
        {/* Hero */}
        <section
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-sm)",
          }}
        >
          <p className="caption" style={{ color: "var(--color-primary-70)" }}>
            On-chain tips · No middleman · Ethereum Sepolia
          </p>
          <h1 className="headline-display">
            Send a coffee.
            <br />
            Leave a note.
          </h1>
          <p
            className="body-lg"
            style={{
              color: "var(--color-primary-70)",
              maxWidth: 480,
              marginTop: 8,
            }}
          >
            Every tip goes directly to the creator — recorded permanently on
            Ethereum. No platform. No cut. No permission required.
          </p>
        </section>

        <hr className="divider" />

        {/* Tip form section */}
        <section>
          <h2 className="headline-md" style={{ marginBottom: "var(--space-sm)" }}>
            Send a tip
          </h2>

          {walletAddress ? (
            <TipForm
              walletAddress={walletAddress}
              onTipConfirmed={handleTipConfirmed}
            />
          ) : (
            <div
              className="card"
              style={{
                padding: "var(--space-md)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "var(--space-sm)",
                textAlign: "center",
                borderStyle: "dashed",
              }}
            >
              <span style={{ fontSize: 32 }}>🦊</span>
              <div>
                <p className="headline-sm" style={{ marginBottom: 6 }}>
                  Connect your wallet to tip
                </p>
                <p
                  className="body-md"
                  style={{ color: "var(--color-primary-70)", marginBottom: 20 }}
                >
                  You'll need MetaMask and a little Sepolia ETH from a faucet.
                </p>
                <WalletConnect
                  onConnect={handleConnect}
                  onDisconnect={handleDisconnect}
                />
              </div>
            </div>
          )}
        </section>

        <hr className="divider" />

        {/* Supporter wall */}
        <SupporterWall refreshTrigger={refreshCount} />

        {/* How it works */}
        <section
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-sm)",
          }}
        >
          <h2 className="headline-md">How it works</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              {
                n: "01",
                title: "Connect your wallet",
                body: "Use MetaMask on Ethereum Sepolia testnet. Get free test ETH from a faucet.",
              },
              {
                n: "02",
                title: "Choose an amount & write a note",
                body: "Pick any amount ≥ 0.0001 ETH. Add an optional message (up to 280 characters).",
              },
              {
                n: "03",
                title: "Confirm in MetaMask",
                body: "Your tip is a real on-chain transaction. Confirm it in your wallet.",
              },
              {
                n: "04",
                title: "Watch it appear on the wall",
                body: "The supporter wall reads directly from Ethereum event logs — permanent and trustless.",
              },
            ].map((step) => (
              <div
                key={step.n}
                className="card"
                style={{ display: "flex", gap: 16, alignItems: "flex-start" }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-label)",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    color: "var(--color-primary-70)",
                    paddingTop: 2,
                    flexShrink: 0,
                    minWidth: 24,
                  }}
                >
                  {step.n}
                </span>
                <div>
                  <p
                    className="body-md"
                    style={{ fontWeight: 600, marginBottom: 4 }}
                  >
                    {step.title}
                  </p>
                  <p className="body-sm" style={{ color: "var(--color-primary-70)" }}>
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer
        style={{
          padding: "var(--space-md)",
          borderTop: "1px solid var(--color-tertiary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <p className="caption" style={{ color: "var(--color-primary-70)" }}>
          Built for MetaMask Community Builder Challenge · Pune
        </p>
        <div style={{ display: "flex", gap: 20 }}>
          <a
            href="https://sepolia.etherscan.io"
            target="_blank"
            rel="noopener noreferrer"
            className="caption"
            style={{ color: "var(--color-primary-70)", textDecoration: "none" }}
          >
            Etherscan ↗
          </a>
          <a
            href="https://sepoliafaucet.com"
            target="_blank"
            rel="noopener noreferrer"
            className="caption"
            style={{ color: "var(--color-primary-70)", textDecoration: "none" }}
          >
            Get test ETH ↗
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="caption"
            style={{ color: "var(--color-primary-70)", textDecoration: "none" }}
          >
            GitHub ↗
          </a>
        </div>
      </footer>
    </div>
  );
}
