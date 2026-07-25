"use client";

import { useState, useEffect, useCallback } from "react";
import {
  SEPOLIA_CHAIN_ID,
  SEPOLIA_CHAIN_ID_HEX,
  SEPOLIA_PARAMS,
  shortenAddress,
} from "../lib/contract";

type WalletState =
  | { status: "idle" }
  | { status: "no_metamask" }
  | { status: "connecting" }
  | { status: "wrong_network"; address: string }
  | { status: "switching_network" }
  | { status: "connected"; address: string; chainId: number };

interface Props {
  onConnect: (address: string) => void;
  onDisconnect: () => void;
}

// Typed ethereum provider
interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, handler: (data: unknown) => void) => void;
  removeListener: (event: string, handler: (data: unknown) => void) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

function getEthereum(): EthereumProvider | null {
  if (typeof window === "undefined") return null;
  return window.ethereum ?? null;
}

export default function WalletConnect({ onConnect, onDisconnect }: Props) {
  const [wallet, setWallet] = useState<WalletState>({ status: "idle" });

  // ── Detect existing connection on mount ────────────────────────────────────
  useEffect(() => {
    const eth = getEthereum();
    if (!eth) { setWallet({ status: "no_metamask" }); return; }

    (async () => {
      try {
        const accounts = (await eth.request({ method: "eth_accounts" })) as string[];
        if (accounts.length > 0) {
          const chainIdHex = (await eth.request({ method: "eth_chainId" })) as string;
          const chainId = parseInt(chainIdHex, 16);
          const address = accounts[0];
          if (chainId === SEPOLIA_CHAIN_ID) {
            setWallet({ status: "connected", address, chainId });
            onConnect(address);
          } else {
            setWallet({ status: "wrong_network", address });
          }
        }
      } catch { /* not connected */ }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Listen for account / network changes ──────────────────────────────────
  useEffect(() => {
    const eth = getEthereum();
    if (!eth) return;

    const handleAccountsChanged = (data: unknown) => {
      const accounts = data as string[];
      if (accounts.length === 0) {
        setWallet({ status: "idle" });
        onDisconnect();
      } else {
        setWallet((prev) => {
          if (prev.status === "connected") return { ...prev, address: accounts[0] };
          return prev;
        });
      }
    };

    const handleChainChanged = (data: unknown) => {
      const chainIdHex = data as string;
      const chainId = parseInt(chainIdHex, 16);
      setWallet((prev) => {
        const address =
          prev.status === "connected" || prev.status === "wrong_network"
            ? prev.address
            : "";
        if (chainId === SEPOLIA_CHAIN_ID) {
          onConnect(address);
          return { status: "connected", address, chainId };
        }
        return { status: "wrong_network", address };
      });
    };

    eth.on("accountsChanged", handleAccountsChanged);
    eth.on("chainChanged", handleChainChanged);
    return () => {
      eth.removeListener("accountsChanged", handleAccountsChanged);
      eth.removeListener("chainChanged", handleChainChanged);
    };
  }, [onConnect, onDisconnect]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const connect = useCallback(async () => {
    const eth = getEthereum();
    if (!eth) return;
    setWallet({ status: "connecting" });
    try {
      const accounts = (await eth.request({ method: "eth_requestAccounts" })) as string[];
      const chainIdHex = (await eth.request({ method: "eth_chainId" })) as string;
      const chainId = parseInt(chainIdHex, 16);
      const address = accounts[0];
      if (chainId === SEPOLIA_CHAIN_ID) {
        setWallet({ status: "connected", address, chainId });
        onConnect(address);
      } else {
        setWallet({ status: "wrong_network", address });
      }
    } catch (err: unknown) {
      const code = (err as { code?: number })?.code;
      if (code === 4001) setWallet({ status: "idle" });
      else setWallet({ status: "idle" });
    }
  }, [onConnect]);

  const switchToSepolia = useCallback(async () => {
    const eth = getEthereum();
    if (!eth) return;
    setWallet((prev) =>
      prev.status === "wrong_network" ? { status: "switching_network" } : prev
    );
    try {
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
      });
    } catch (err: unknown) {
      const code = (err as { code?: number })?.code;
      if (code === 4902) {
        try {
          await eth.request({ method: "wallet_addEthereumChain", params: [SEPOLIA_PARAMS] });
        } catch { /* user rejected */ }
      }
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet({ status: "idle" });
    onDisconnect();
  }, [onDisconnect]);

  // ── Render ─────────────────────────────────────────────────────────────────
  if (wallet.status === "no_metamask") {
    return (
      <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer"
        className="btn-primary" style={{ textDecoration: "none" }}>
        Install MetaMask
      </a>
    );
  }
  if (wallet.status === "idle") {
    return <button className="btn-primary" onClick={connect}>Connect Wallet</button>;
  }
  if (wallet.status === "connecting") {
    return (
      <button className="btn-primary" disabled>
        <span className="spinner" /> Connecting…
      </button>
    );
  }
  if (wallet.status === "wrong_network") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
        <span className="chip chip-error">Wrong network</span>
        <button className="btn-primary" onClick={switchToSepolia}>Switch to Sepolia</button>
      </div>
    );
  }
  if (wallet.status === "switching_network") {
    return (
      <button className="btn-primary" disabled>
        <span className="spinner" /> Switching…
      </button>
    );
  }
  // connected
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span className="chip chip-success">
        <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%",
          background: "#10b981", marginRight: 6 }} />
        {shortenAddress(wallet.address)}
      </span>
      <button className="btn-secondary" onClick={disconnect}>Disconnect</button>
    </div>
  );
}
