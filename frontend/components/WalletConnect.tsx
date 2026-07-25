"use client";

import { useState, useEffect, useCallback } from "react";
import {
  SEPOLIA_CHAIN_ID,
  SEPOLIA_CHAIN_ID_HEX,
  SEPOLIA_PARAMS,
  shortenAddress,
  formatEth,
} from "../lib/contract";
import { ethers } from "ethers";

export type WalletState =
  | { status: "idle" }
  | { status: "no_metamask" }
  | { status: "connecting" }
  | { status: "wrong_network"; address: string }
  | { status: "switching_network" }
  | { status: "connected"; address: string; chainId: number; balance: bigint };

interface Props {
  onConnect: (address: string) => void;
  onDisconnect: () => void;
}

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

async function fetchBalance(address: string): Promise<bigint> {
  try {
    const eth = getEthereum();
    if (!eth) return BigInt(0);
    const hex = (await eth.request({
      method: "eth_getBalance",
      params: [address, "latest"],
    })) as string;
    return BigInt(hex);
  } catch {
    return BigInt(0);
  }
}

export default function WalletConnect({ onConnect, onDisconnect }: Props) {
  const [wallet, setWallet] = useState<WalletState>({ status: "idle" });

  const updateBalance = useCallback(async (address: string) => {
    const balance = await fetchBalance(address);
    setWallet((prev) =>
      prev.status === "connected" ? { ...prev, balance } : prev
    );
  }, []);

  // Detect existing connection on mount
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
            const balance = await fetchBalance(address);
            setWallet({ status: "connected", address, chainId, balance });
            onConnect(address);
          } else {
            setWallet({ status: "wrong_network", address });
          }
        }
      } catch { /* not connected */ }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for account / network changes
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
          if (prev.status === "connected") {
            updateBalance(accounts[0]);
            return { ...prev, address: accounts[0] };
          }
          return prev;
        });
        onConnect(accounts[0]);
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
        if (!address) return prev;
        if (chainId === SEPOLIA_CHAIN_ID) {
          onConnect(address);
          fetchBalance(address).then((balance) =>
            setWallet({ status: "connected", address, chainId, balance })
          );
          return { status: "connected", address, chainId, balance: BigInt(0) };
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
  }, [onConnect, onDisconnect, updateBalance]);

  // Poll balance every 15s when connected
  useEffect(() => {
    if (wallet.status !== "connected") return;
    const id = setInterval(() => updateBalance(wallet.address), 15_000);
    return () => clearInterval(id);
  }, [wallet.status, wallet.status === "connected" ? (wallet as Extract<WalletState, {status:"connected"}>).address : "", updateBalance]); // eslint-disable-line react-hooks/exhaustive-deps

  // Actions
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
        const balance = await fetchBalance(address);
        setWallet({ status: "connected", address, chainId, balance });
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

  // Render
  if (wallet.status === "no_metamask") {
    return (
      <a
        href="https://metamask.io/download/"
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary"
        style={{ textDecoration: "none" }}
      >
        Install MetaMask
      </a>
    );
  }
  if (wallet.status === "idle") {
    return (
      <button className="btn-primary" onClick={connect} id="btn-connect-wallet">
        Connect Wallet
      </button>
    );
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
        <button className="btn-primary" onClick={switchToSepolia}>
          Switch to Sepolia
        </button>
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

  // connected — show address + balance chip + disconnect
  const connected = wallet as Extract<WalletState, { status: "connected" }>;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
        <span className="chip chip-success" id="wallet-address-chip">
          <span
            style={{
              display: "inline-block",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#10b981",
              marginRight: 6,
              flexShrink: 0,
            }}
          />
          {shortenAddress(connected.address)}
        </span>
        {connected.balance > BigInt(0) && (
          <span
            style={{
              fontFamily: "var(--font-label)",
              fontSize: 10,
              letterSpacing: "0.06em",
              color: "var(--color-primary-70)",
            }}
          >
            {formatEth(connected.balance)}
          </span>
        )}
      </div>
      <button className="btn-secondary" onClick={disconnect} style={{ height: 36, padding: "0 16px", fontSize: 11 }}>
        Disconnect
      </button>
    </div>
  );
}
