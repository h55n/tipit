import { ethers } from "ethers";
import { getReadContract } from "./contract";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TipEvent {
  sender: string;
  amount: bigint;
  message: string;
  timestamp: number;
  txHash: string;
  blockNumber: number;
}

// ── Fetch all historical tips ─────────────────────────────────────────────────

/**
 * Fetch all NewTip events from genesis to latest.
 * This is the authoritative source for the supporter wall — not local state.
 */
export async function fetchAllTips(): Promise<TipEvent[]> {
  const contract = getReadContract();

  const filter = contract.filters.NewTip();
  const logs = await contract.queryFilter(filter, 0, "latest");

  const tips: TipEvent[] = logs.map((log) => {
    const parsed = log as ethers.EventLog;
    return {
      sender:      parsed.args.sender    as string,
      amount:      parsed.args.amount    as bigint,
      message:     parsed.args.message   as string,
      timestamp:   Number(parsed.args.timestamp),
      txHash:      parsed.transactionHash,
      blockNumber: parsed.blockNumber,
    };
  });

  // Newest first
  return tips.sort((a, b) => b.blockNumber - a.blockNumber);
}

// ── Subscribe to live tips ────────────────────────────────────────────────────

/**
 * Subscribe to incoming NewTip events in real time.
 * Returns an unsubscribe function — always call it on component unmount.
 *
 * @example
 *   const unsub = subscribeTips((tip) => setTips(prev => [tip, ...prev]));
 *   return () => unsub();
 */
export function subscribeTips(
  onTip: (tip: TipEvent) => void
): () => void {
  const contract = getReadContract();

  const handler = (
    sender: string,
    amount: bigint,
    message: string,
    timestamp: bigint,
    event: ethers.EventLog
  ) => {
    onTip({
      sender,
      amount,
      message,
      timestamp: Number(timestamp),
      txHash:      event.transactionHash,
      blockNumber: event.blockNumber,
    });
  };

  contract.on("NewTip", handler);

  return () => {
    contract.off("NewTip", handler);
  };
}
