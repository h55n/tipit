# ☕ Tip Jar — On-Chain Creator Tips

> **MetaMask Community Builder Challenge · Pune**

A decentralized tip jar where supporters send ETH directly to a creator with an optional message. Every tip is recorded permanently on Ethereum — no platform, no cut, no middleman. The supporter wall reads directly from on-chain events, not a database.

---

## Live Demo

Deployed contract: `0x...` ← paste address after deploy  
Network: **Ethereum Sepolia Testnet**  
Frontend: `http://localhost:3000` (local) or your deployment URL

---

## Architecture

```
tipjar/
├── contracts/
│   └── TipJar.sol          Solidity contract (payable tip, owner withdraw)
├── scripts/
│   └── deploy.js           Hardhat deploy script → writes frontend/deployment.json
├── test/
│   └── TipJar.test.js      Full test suite (13 tests)
├── hardhat.config.js
├── .env.example
│
└── frontend/               Next.js 14 app
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx         Hero + TipForm + SupporterWall
    │   └── globals.css      Loops House design tokens
    ├── components/
    │   ├── WalletConnect.tsx  MetaMask connection + network switching
    │   ├── TipForm.tsx        Amount + message + transaction lifecycle
    │   ├── SupporterWall.tsx  On-chain event feed (queryFilter + live listener)
    │   └── TxStatus.tsx       Pending / confirmed / failed states
    └── lib/
        ├── contract.ts      ABI, address, ethers.js helpers
        └── events.ts        fetchAllTips() + subscribeTips()
```

---

## Quick Start

### 1. Prerequisites

- Node 20+ (`node -v`)
- MetaMask browser extension
- A burner wallet private key (generate one in MetaMask → never use your main wallet)
- A [QuickNode](https://www.quicknode.com/) free Sepolia endpoint
- Sepolia test ETH from a faucet

### 2. Install dependencies

```bash
# Root (Hardhat)
npm install

# Frontend (Next.js)
cd frontend && npm install
```

### 3. Configure environment

```bash
# Root — for deploying the contract
cp .env.example .env
# Fill in: QUICKNODE_SEPOLIA_URL, DEPLOYER_PRIVATE_KEY

# Frontend — after deploying
cd frontend
cp .env.local.example .env.local
# Fill in: NEXT_PUBLIC_CONTRACT_ADDRESS
```

### 4. Get Sepolia ETH

Fund your burner wallet from a faucet:
- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia
- https://faucet.quicknode.com/ethereum/sepolia

### 5. Compile & test the contract

```bash
npx hardhat compile
npx hardhat test
```

Expected output:
```
TipJar
  Deployment
    ✓ sets the deployer as owner
    ✓ starts with zero balance
  tip()
    ✓ accepts a tip with a message and emits NewTip
    ✓ accepts a tip with an empty message
    ✓ reverts if value is below minimum
    ✓ reverts if message exceeds 280 bytes
    ✓ reverts on plain ETH sends
    ✓ accumulates balance across multiple tippers
  withdraw()
    ✓ allows owner to withdraw all ETH
    ✓ emits Withdrawal event
    ✓ resets balance to zero after withdrawal
    ✓ reverts if non-owner tries to withdraw
    ✓ reverts if balance is zero

13 passing
```

### 6. Deploy to Sepolia

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

This prints the deployed address and writes `frontend/deployment.json`.

Copy the address into `frontend/.env.local`:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourAddressHere
```

Also update `frontend/lib/contract.ts` → `CONTRACT_ADDRESS` fallback (optional, for open-source repos).

### 7. (Optional) Verify on Etherscan

```bash
ETHERSCAN_API_KEY=your_key npx hardhat verify --network sepolia 0xYourContractAddress
```

### 8. Run the frontend

```bash
cd frontend
npm run dev
```

Open http://localhost:3000 — connect MetaMask on Sepolia and send a tip!

---

## Smart Contract

**`contracts/TipJar.sol`**

```solidity
function tip(string calldata message) external payable
```
- Minimum tip: `0.0001 ETH`  
- Max message: `280 bytes`  
- Emits `NewTip(address sender, uint256 amount, string message, uint256 timestamp)`

```solidity
function withdraw() external  // owner only
```
- Transfers full balance to owner  
- Emits `Withdrawal(address to, uint256 amount)`

**Why events are the source of truth:**  
The supporter wall never uses local React state as the primary source. On mount, `queryFilter(filters.NewTip())` fetches all historical tips from the chain. A live listener (`contract.on("NewTip", ...)`) then appends new tips in real time. If you refresh the page, you see the same wall — because it's reading Ethereum, not a server.

---

## Frontend Features

| Feature | Implementation |
|---|---|
| Wallet connect | `eth_requestAccounts` via `window.ethereum` |
| Network check | Detects chainId, prompts `wallet_switchEthereumChain` |
| Tip form | Preset amounts + custom input + message with live byte counter |
| Transaction lifecycle | idle → pending (with Etherscan link) → confirmed / failed |
| Supporter wall | `queryFilter` historical events + live `contract.on` listener |
| Error handling | User rejection, wrong network, failed tx, MetaMask not installed |

---

## Stack

| Layer | Tool |
|---|---|
| Smart contracts | Solidity 0.8.24 |
| Local dev / deploy | Hardhat 2.x |
| RPC endpoint | QuickNode (Sepolia) |
| Frontend framework | Next.js 14 (App Router) |
| Ethereum library | ethers.js v6 |
| Wallet | MetaMask |
| Styling | Loops House design system (CSS custom properties) |
| Network | Ethereum Sepolia Testnet |

---

## Security Notes

- **Never commit `.env`** — it contains your private key
- Use a **burner wallet** for deployment, not your main wallet
- The contract owner is set at deploy time and cannot be changed
- Messages are stored in event logs (cheaper than storage), not contract state

---

## Claude Code Prompt

If you're continuing development with Claude Code in your IDE, use this prompt:

```
I have a deployed TipJar.sol on Ethereum Sepolia. The project has:
- contracts/TipJar.sol — Solidity contract with tip(string) payable, withdraw() owner-only, NewTip event
- frontend/ — Next.js 14 app with ethers.js v6, Loops House design system
- frontend/lib/contract.ts — ABI, getReadContract(), getWriteContract(), CONTRACT_ADDRESS
- frontend/lib/events.ts — fetchAllTips() via queryFilter, subscribeTips() live listener
- frontend/components/WalletConnect.tsx — MetaMask connect + Sepolia network check
- frontend/components/TipForm.tsx — amount presets, message textarea, tx lifecycle
- frontend/components/SupporterWall.tsx — on-chain event feed, newest-first
- frontend/components/TxStatus.tsx — pending/confirmed/failed UI

Tasks to complete:
1. Add NEXT_PUBLIC_CONTRACT_ADDRESS from .env.local to frontend/lib/contract.ts
2. Run `cd frontend && npm install && npm run dev` and test the full flow
3. If the contract is not yet deployed, run `npx hardhat run scripts/deploy.js --network sepolia`
4. After a successful testnet tip, verify the supporter wall updates from queryFilter
5. (Optional) Deploy the frontend to Vercel: `cd frontend && npx vercel`
```
