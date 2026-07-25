// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title TipJar
 * @notice A transparent, on-chain tip jar for creators.
 *         Anyone can send ETH with an optional message.
 *         Every tip is recorded as a NewTip event — the permanent,
 *         trustworthy source of truth for the supporter wall.
 *         Only the owner can withdraw funds.
 */
contract TipJar {
    // ── State ─────────────────────────────────────────────────────────────────

    address public immutable owner;

    /// @dev Max UTF-8 bytes for a tip message
    uint256 public constant MAX_MESSAGE_LENGTH = 280;

    /// @dev Minimum tip amount (0.0001 ETH) — prevents dust spam
    uint256 public constant MIN_TIP = 0.0001 ether;

    // ── Events ────────────────────────────────────────────────────────────────

    /**
     * @notice Emitted for every tip. The frontend reads these to build
     *         the live supporter wall — not local state, not a database.
     */
    event NewTip(
        address indexed sender,
        uint256 amount,
        string  message,
        uint256 timestamp
    );

    /// @notice Emitted when the owner withdraws accumulated tips.
    event Withdrawal(address indexed to, uint256 amount);

    // ── Errors ────────────────────────────────────────────────────────────────

    error NotOwner();
    error TipTooSmall(uint256 sent, uint256 minimum);
    error MessageTooLong(uint256 length, uint256 maximum);
    error TransferFailed();
    error NothingToWithdraw();

    // ── Constructor ───────────────────────────────────────────────────────────

    constructor() {
        owner = msg.sender;
    }

    // ── External functions ────────────────────────────────────────────────────

    /**
     * @notice Send a tip with an optional message.
     * @param message A short note from the supporter (max 280 bytes).
     *
     * Requirements:
     * - msg.value >= MIN_TIP
     * - message length <= MAX_MESSAGE_LENGTH
     */
    function tip(string calldata message) external payable {
        if (msg.value < MIN_TIP) {
            revert TipTooSmall(msg.value, MIN_TIP);
        }

        bytes memory msgBytes = bytes(message);
        if (msgBytes.length > MAX_MESSAGE_LENGTH) {
            revert MessageTooLong(msgBytes.length, MAX_MESSAGE_LENGTH);
        }

        emit NewTip(msg.sender, msg.value, message, block.timestamp);
    }

    /**
     * @notice Withdraw all accumulated ETH to the owner's address.
     *         Only callable by the owner.
     */
    function withdraw() external {
        if (msg.sender != owner) revert NotOwner();

        uint256 balance = address(this).balance;
        if (balance == 0) revert NothingToWithdraw();

        emit Withdrawal(owner, balance);

        (bool ok, ) = owner.call{value: balance}("");
        if (!ok) revert TransferFailed();
    }

    /**
     * @notice Returns the current contract balance (total unclaimed tips).
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // ── Receive / Fallback ────────────────────────────────────────────────────

    /// @dev Plain ETH sends (no calldata) are rejected — use tip() instead.
    receive() external payable {
        revert("Use the tip() function");
    }
}
