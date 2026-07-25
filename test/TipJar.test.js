const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TipJar", function () {
  let tipJar;
  let owner, tipper1, tipper2;

  const MIN_TIP = ethers.parseEther("0.0001");

  beforeEach(async function () {
    [owner, tipper1, tipper2] = await ethers.getSigners();
    const TipJar = await ethers.getContractFactory("TipJar");
    tipJar = await TipJar.deploy();
  });

  // ── Deployment ──────────────────────────────────────────────────────────────

  describe("Deployment", function () {
    it("sets the deployer as owner", async function () {
      expect(await tipJar.owner()).to.equal(owner.address);
    });

    it("starts with zero balance", async function () {
      expect(await tipJar.getBalance()).to.equal(0n);
    });
  });

  // ── tip() ───────────────────────────────────────────────────────────────────

  describe("tip()", function () {
    it("accepts a tip with a message and emits NewTip", async function () {
      const amount = ethers.parseEther("0.01");
      const message = "Love your comics!";

      const tx = await tipJar.connect(tipper1).tip(message, { value: amount });
      const receipt = await tx.wait();

      // Check the event
      const event = receipt.logs.find(
        (l) => l.fragment && l.fragment.name === "NewTip"
      );
      expect(event).to.exist;
      expect(event.args.sender).to.equal(tipper1.address);
      expect(event.args.amount).to.equal(amount);
      expect(event.args.message).to.equal(message);
    });

    it("accepts a tip with an empty message", async function () {
      await expect(
        tipJar.connect(tipper1).tip("", { value: MIN_TIP })
      ).to.not.be.reverted;
    });

    it("reverts if value is below minimum", async function () {
      await expect(
        tipJar.connect(tipper1).tip("hi", { value: MIN_TIP - 1n })
      ).to.be.revertedWithCustomError(tipJar, "TipTooSmall");
    });

    it("reverts if message exceeds 280 bytes", async function () {
      const longMsg = "a".repeat(281);
      await expect(
        tipJar.connect(tipper1).tip(longMsg, { value: MIN_TIP })
      ).to.be.revertedWithCustomError(tipJar, "MessageTooLong");
    });

    it("reverts on plain ETH sends (no calldata)", async function () {
      await expect(
        tipper1.sendTransaction({ to: await tipJar.getAddress(), value: MIN_TIP })
      ).to.be.reverted;
    });

    it("accumulates balance across multiple tippers", async function () {
      await tipJar.connect(tipper1).tip("First!", { value: ethers.parseEther("0.01") });
      await tipJar.connect(tipper2).tip("Second!", { value: ethers.parseEther("0.02") });

      expect(await tipJar.getBalance()).to.equal(ethers.parseEther("0.03"));
    });
  });

  // ── withdraw() ──────────────────────────────────────────────────────────────

  describe("withdraw()", function () {
    beforeEach(async function () {
      await tipJar.connect(tipper1).tip("Support!", { value: ethers.parseEther("0.05") });
    });

    it("allows owner to withdraw all ETH", async function () {
      const before = await ethers.provider.getBalance(owner.address);
      const tx = await tipJar.connect(owner).withdraw();
      const receipt = await tx.wait();
      const gas = receipt.gasUsed * receipt.gasPrice;
      const after = await ethers.provider.getBalance(owner.address);

      expect(after).to.be.closeTo(
        before + ethers.parseEther("0.05") - gas,
        ethers.parseEther("0.0001")
      );
    });

    it("emits Withdrawal event", async function () {
      await expect(tipJar.connect(owner).withdraw())
        .to.emit(tipJar, "Withdrawal")
        .withArgs(owner.address, ethers.parseEther("0.05"));
    });

    it("resets balance to zero after withdrawal", async function () {
      await tipJar.connect(owner).withdraw();
      expect(await tipJar.getBalance()).to.equal(0n);
    });

    it("reverts if non-owner tries to withdraw", async function () {
      await expect(
        tipJar.connect(tipper1).withdraw()
      ).to.be.revertedWithCustomError(tipJar, "NotOwner");
    });

    it("reverts if balance is zero", async function () {
      await tipJar.connect(owner).withdraw();
      await expect(
        tipJar.connect(owner).withdraw()
      ).to.be.revertedWithCustomError(tipJar, "NothingToWithdraw");
    });
  });
});
