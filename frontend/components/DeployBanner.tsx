"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { TIPJAR_ABI, CONTRACT_ADDRESS } from "../lib/contract";

// Only show the banner if no contract is deployed yet
const IS_CONTRACT_SET =
  CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000" &&
  CONTRACT_ADDRESS !== "" &&
  CONTRACT_ADDRESS !== undefined;

interface Props {
  walletAddress: string | null;
  onDeployed: (address: string) => void;
}

type DeployState =
  | { status: "idle" }
  | { status: "deploying" }
  | { status: "success"; address: string }
  | { status: "error"; message: string };

export default function DeployBanner({ walletAddress, onDeployed }: Props) {
  const [deploy, setDeploy] = useState<DeployState>({ status: "idle" });

  if (IS_CONTRACT_SET) return null;

  async function deployContract() {
    if (!window.ethereum) return;
    setDeploy({ status: "deploying" });
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Fetch the bytecode from the ABI file — we embed it at build time
      // The bytecode is imported from tipjar-bytecode.ts (generated at compile time)
      const { TIPJAR_BYTECODE } = await import("../lib/tipjar-bytecode");

      const factory = new ethers.ContractFactory(TIPJAR_ABI, TIPJAR_BYTECODE, signer);
      const contract = await factory.deploy();
      await contract.waitForDeployment();
      const address = await contract.getAddress();

      setDeploy({ status: "success", address });
      onDeployed(address);

      // Copy address to clipboard
      try { await navigator.clipboard.writeText(address); } catch { /* ok */ }
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || "Deployment failed";
      const short = msg.length > 160 ? msg.slice(0, 160) + "…" : msg;
      if (msg.includes("user rejected") || msg.includes("ACTION_REJECTED")) {
        setDeploy({ status: "idle" });
      } else {
        setDeploy({ status: "error", message: short });
      }
    }
  }

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #0f2c23 0%, #1a4a37 100%)",
        borderRadius: "var(--radius-lg)",
        padding: "24px 28px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        marginBottom: 8,
      }}
    >
      <div>
        <p
          style={{
            fontFamily: "var(--font-label)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgba(248,255,232,0.55)",
            marginBottom: 6,
          }}
        >
          ⚡ Developer mode — no contract deployed
        </p>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 20,
            fontWeight: 700,
            color: "#f8ffe8",
            letterSpacing: "-0.02em",
          }}
        >
          Deploy TipJar directly from your wallet
        </p>
        <p style={{ fontSize: 13, color: "rgba(248,255,232,0.7)", lineHeight: 1.5, marginTop: 4 }}>
          No private keys needed in any config file. MetaMask will prompt you to confirm the deployment transaction.
        </p>
      </div>

      {deploy.status === "idle" && (
        <button
          id="btn-deploy-contract"
          onClick={deployContract}
          disabled={!walletAddress}
          style={{
            alignSelf: "flex-start",
            background: "#f8ffe8",
            color: "#0f2c23",
            fontFamily: "var(--font-label)",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            border: "none",
            borderRadius: "var(--radius-full)",
            padding: "14px 28px",
            cursor: walletAddress ? "pointer" : "not-allowed",
            opacity: walletAddress ? 1 : 0.4,
            transition: "opacity 0.15s",
          }}
        >
          {walletAddress ? "🚀 Deploy Contract via MetaMask" : "Connect wallet first"}
        </button>
      )}

      {deploy.status === "deploying" && (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            className="spinner"
            style={{ borderTopColor: "#f8ffe8", borderColor: "rgba(248,255,232,0.2)" }}
          />
          <p style={{ color: "#f8ffe8", fontSize: 14 }}>
            Deploying… confirm in MetaMask
          </p>
        </div>
      )}

      {deploy.status === "success" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>✅</span>
            <p style={{ color: "#6ee7b7", fontSize: 14, fontWeight: 600 }}>
              Contract deployed!
            </p>
          </div>
          <div
            style={{
              background: "rgba(248,255,232,0.08)",
              borderRadius: 8,
              padding: "10px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <p style={{ fontFamily: "var(--font-label)", fontSize: 10, color: "rgba(248,255,232,0.5)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Contract address (copied to clipboard)
            </p>
            <code style={{ fontSize: 13, color: "#f8ffe8", wordBreak: "break-all" }}>
              {deploy.address}
            </code>
            <p style={{ fontSize: 12, color: "rgba(248,255,232,0.6)", lineHeight: 1.5 }}>
              Add this to <code style={{ fontSize: 11 }}>frontend/.env.local</code> as{" "}
              <code style={{ fontSize: 11 }}>NEXT_PUBLIC_CONTRACT_ADDRESS</code> and restart the dev server.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
              <a
                href={`https://sepolia.etherscan.io/address/${deploy.address}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12, color: "#6ee7b7", textDecoration: "underline" }}
              >
                View on Etherscan ↗
              </a>
            </div>
          </div>
        </div>
      )}

      {deploy.status === "error" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <p style={{ color: "#fca5a5", fontSize: 13 }}>
            ✕ {deploy.message}
          </p>
          <button
            onClick={() => setDeploy({ status: "idle" })}
            style={{
              alignSelf: "flex-start",
              background: "transparent",
              border: "1px solid rgba(248,255,232,0.3)",
              color: "#f8ffe8",
              fontSize: 12,
              borderRadius: "var(--radius-full)",
              padding: "8px 20px",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
