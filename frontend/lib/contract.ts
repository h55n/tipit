import { ethers } from "ethers";
import TIPJAR_ABI_JSON from "./tipjar-abi.json";

// ── ABI ───────────────────────────────────────────────────────────────────────
// Imported from lib/tipjar-abi.json (compiled from contracts/TipJar.sol).
// After any contract change: re-run `npx hardhat compile` then copy the new
// ABI from artifacts/contracts/TipJar.sol/TipJar.json into tipjar-abi.json.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TIPJAR_ABI = TIPJAR_ABI_JSON as any[];

// ── Network config ────────────────────────────────────────────────────────────
export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_CHAIN_ID_HEX = "0xaa36a7";

export const SEPOLIA_PARAMS = {
  chainId: SEPOLIA_CHAIN_ID_HEX,
  chainName: "Sepolia Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: ["https://rpc.sepolia.org"],
  blockExplorerUrls: ["https://sepolia.etherscan.io"],
};

// ── Contract address ──────────────────────────────────────────────────────────
// After deploying, paste your contract address here OR set NEXT_PUBLIC_CONTRACT_ADDRESS in .env.local
export const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0x0000000000000000000000000000000000000000"; // ← replace after deploy

// ── Factory helpers ───────────────────────────────────────────────────────────

/**
 * Get a read-only contract instance (no wallet needed).
 * Prefers NEXT_PUBLIC_RPC_URL (set to your QuickNode HTTP endpoint) over the
 * public RPC, which can be rate-limited under traffic.
 */
export function getReadContract(): ethers.Contract {
  const rpcUrl =
    process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.sepolia.org";
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  return new ethers.Contract(CONTRACT_ADDRESS, TIPJAR_ABI, provider);
}

/**
 * Get a write-enabled contract instance using the browser wallet.
 */
export async function getWriteContract(): Promise<ethers.Contract> {
  if (!window.ethereum) throw new Error("MetaMask not installed");
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, TIPJAR_ABI, signer);
}

/**
 * Shorten a wallet address for display: 0x1234…abcd
 */
export function shortenAddress(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/**
 * Format an ETH amount from wei bigint to a human-readable string.
 */
export function formatEth(wei: bigint): string {
  const eth = parseFloat(ethers.formatEther(wei));
  if (eth < 0.001) return `${(eth * 1000).toFixed(3)} mETH`;
  return `${eth.toFixed(4)} ETH`;
}
