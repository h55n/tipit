"use client";

import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { getWriteContract } from "../lib/contract";
import TxStatus, { TxState } from "./TxStatus";

const MAX_MSG = 280;
const MIN_ETH = 0.0001;

const PRESET_AMOUNTS = ["0.001", "0.005", "0.01", "0.05"];

interface Props {
  walletAddress: string;
  onTipConfirmed: () => void;
}

export default function TipForm({ walletAddress, onTipConfirmed }: Props) {
  const [amount, setAmount] = useState("0.001");
  const [message, setMessage] = useState("");
  const [tx, setTx] = useState<TxState>({ status: "idle" });

  const msgLen = new TextEncoder().encode(message).length;
  const msgOver = msgLen > MAX_MSG;

  const isValid =
    amount !== "" &&
    parseFloat(amount) >= MIN_ETH &&
    !isNaN(parseFloat(amount)) &&
    !msgOver &&
    tx.status !== "pending";

  const sendTip = useCallback(async () => {
    if (!isValid) return;

    setTx({ status: "idle" });

    try {
      const contract = await getWriteContract();
      const value = ethers.parseEther(amount);

      // Call tip() — MetaMask opens confirmation dialog
      const txResponse = await contract.tip(message, { value });

      // Transaction submitted — show pending
      setTx({ status: "pending", hash: txResponse.hash });

      // Wait for confirmation
      await txResponse.wait();

      setTx({ status: "confirmed", hash: txResponse.hash });
      setMessage("");
      setAmount("0.001");
      onTipConfirmed();
    } catch (err: unknown) {
      const error = err as { code?: string | number; reason?: string; message?: string };

      if (
        error.code === "ACTION_REJECTED" ||
        error.code === 4001 ||
        error.message?.includes("user rejected")
      ) {
        setTx({ status: "failed", message: "Transaction cancelled in MetaMask." });
      } else if (error.reason) {
        setTx({ status: "failed", message: `Transaction failed: ${error.reason}` });
      } else if (error.message) {
        const msg = error.message.length > 120
          ? error.message.slice(0, 120) + "…"
          : error.message;
        setTx({ status: "failed", message: msg });
      } else {
        setTx({ status: "failed", message: "Something went wrong. Please try again." });
      }
    }
  }, [isValid, amount, message, onTipConfirmed]);

  const isPending = tx.status === "pending";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-sm)",
      }}
    >
      {/* Amount presets */}
      <div>
        <label
          className="caption"
          style={{ display: "block", marginBottom: 8 }}
        >
          Amount (ETH)
        </label>
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 10,
          }}
        >
          {PRESET_AMOUNTS.map((p) => (
            <button
              key={p}
              onClick={() => setAmount(p)}
              disabled={isPending}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-full)",
                border: "1.5px solid",
                borderColor:
                  amount === p
                    ? "var(--color-primary)"
                    : "var(--color-tertiary)",
                background:
                  amount === p ? "var(--color-primary)" : "transparent",
                color:
                  amount === p ? "var(--color-neutral)" : "var(--color-secondary)",
                fontFamily: "var(--font-label)",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.06em",
                cursor: isPending ? "not-allowed" : "pointer",
                transition: "all 0.12s ease",
                opacity: isPending ? 0.5 : 1,
              }}
            >
              {p} ETH
            </button>
          ))}
        </div>
        <input
          type="number"
          className="input"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min={MIN_ETH}
          step="0.001"
          placeholder="0.001"
          disabled={isPending}
          style={{ maxWidth: 200 }}
        />
        {amount !== "" &&
          !isNaN(parseFloat(amount)) &&
          parseFloat(amount) < MIN_ETH && (
            <p
              className="body-sm"
              style={{ color: "var(--color-error)", marginTop: 4 }}
            >
              Minimum tip is {MIN_ETH} ETH
            </p>
          )}
      </div>

      {/* Message */}
      <div>
        <label
          className="caption"
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <span>Message (optional)</span>
          <span style={{ color: msgOver ? "var(--color-error)" : undefined }}>
            {msgLen} / {MAX_MSG}
          </span>
        </label>
        <textarea
          className="input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Love your work! Keep going ☕"
          rows={3}
          disabled={isPending}
          style={{
            resize: "vertical",
            minHeight: 80,
            borderColor: msgOver ? "var(--color-error)" : undefined,
          }}
        />
        {msgOver && (
          <p
            className="body-sm"
            style={{ color: "var(--color-error)", marginTop: 4 }}
          >
            Message too long — max {MAX_MSG} characters
          </p>
        )}
      </div>

      {/* Sender info */}
      <p className="body-sm" style={{ color: "var(--color-primary-70)" }}>
        Sending from{" "}
        <span
          style={{
            fontFamily: "var(--font-label)",
            fontSize: 11,
            letterSpacing: "0.04em",
            color: "var(--color-secondary)",
          }}
        >
          {walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}
        </span>
        {" "}on Sepolia testnet
      </p>

      {/* Send button */}
      <button
        className="btn-primary"
        onClick={sendTip}
        disabled={!isValid}
        style={{ alignSelf: "flex-start" }}
      >
        {isPending ? (
          <>
            <span className="spinner" style={{ borderTopColor: "var(--color-neutral)" }} />
            Waiting for confirmation…
          </>
        ) : (
          `Send ${amount || "0"} ETH ☕`
        )}
      </button>

      {/* Transaction status */}
      <TxStatus tx={tx} />
    </div>
  );
}
