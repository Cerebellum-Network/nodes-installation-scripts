import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import { KeypairType } from "@polkadot/util-crypto/types";
import { KeyringPair } from "@polkadot/keyring/types";
import { EventRecord, ExtrinsicStatus } from "@polkadot/types/interfaces";
import config from "./network-custom-types";
import * as dotenv from "dotenv";
dotenv.config();

class Validator {
  private api: ApiPromise;
  private keyRingType: KeypairType;
  private stashAccount: KeyringPair;
  private controllerAccount: KeyringPair;
  private sessionKey;
  private stashBalance: number;
  private controllerBalance: number;

  /**
   * Initialization - Connecting to blockchain.
   */
  public async init() {
    const provider = process.env.PROVIDER;
    console.log(`Connecting to blockchain: ${provider}`);
    const wsProvider = new WsProvider(provider);
    this.api = await ApiPromise.create({ provider: wsProvider, types: config});
    await this.api.isReady;
    const chain = await this.api.rpc.system.chain();
    console.log(`Connected to: ${chain}\n`);
  }

  /**
   * Load stash and controller accounts.
   */
  public async loadAccounts() {
    console.log(`Loading your accounts`);
    const keyring = new Keyring({ type: "sr25519" });
    this.stashAccount = keyring.addFromMnemonic(process.env.STASH_ACCOUNT_MNEMONIC);
    this.controllerAccount = keyring.addFromMnemonic(process.env.CONTROLLER_ACCOUNT_MNEMONIC);
    const {
      data: { free: sbalance },
    } = await this.api.query.system.account(this.stashAccount.address);
    this.stashBalance = Number(sbalance);
    const {
      data: { free: cbalance },
    } = await this.api.query.system.account(this.controllerAccount.address);
    this.controllerBalance = Number(cbalance);
    console.log(
      `Your Stash Account is ${this.stashAccount.address} and balance is ${this.stashBalance}`
    );
    console.log(
      `Your Controller Account is ${this.controllerAccount.address} and balance is ${this.controllerBalance}\n`
    );
  }

  /**
   * Generate session key
   */
  public async generateSessionKey() {
    console.log(`\nGenerating Session Key`);
    this.sessionKey = await this.api.rpc.author.rotateKeys();
    console.log(`Session Key: ${this.sessionKey}`);
  }

  /**
   * Add validator to the node
   * @param bondValue The amount to be stashed
   * @param payee The rewards destination account
   */
  public addValidator() {
    console.log(`\nAdding validator`);
    const bondValue = BigInt(process.env.BOND_VALUE);
    console.log(`Bond value is ${bondValue}`);
    if (this.stashBalance <= Number(bondValue)) {
      throw new Error("Bond value needs to be lesser than balance.");
    }

    const transaction = this.api.tx.staking.bond(
      this.controllerAccount.address,
      bondValue,
      "Staked"
    );

    return new Promise((res, rej) => {
      transaction
        .signAndSend(this.stashAccount, this.sendStatusCb.bind(this, res, rej, undefined))
        .catch((err) => rej(err));
    });
  }

  public async setController() {
    console.log(`\n Setting controller account`);
    const transaction = this.api.tx.staking.setController(
      this.controllerAccount.address
    );

    return new Promise((res, rej) => {
      transaction
        .signAndSend(this.stashAccount, this.sendStatusCb.bind(this, res, rej, undefined))
        .catch((err) => rej(err));
    });
  }

  /**
   * Set session key
   * @param sessionKey session key
   */
  public async setSessionKey() {
    console.log(`\nSetting session key`);
    const EMPTY_PROOF = new Uint8Array();
    const transaction = this.api.tx.session.setKeys(
      this.sessionKey,
      EMPTY_PROOF
    );

    return new Promise((res, rej) => {
      transaction
        .signAndSend(
          this.controllerAccount,
          this.sendStatusCb.bind(this, res, rej, undefined)
        )
        .catch((err) => rej(err));
    });
  }

  /**
   * set rewards commission
   * @param REWARD_COMMISSION rewards commission
   */
  public async setCommission() {
    console.log(`\nSetting reward commission`);
    // https://github.com/polkadot-js/apps/blob/23dad13c9e67de651e5551e4ce7cba3d63d8bb47/packages/page-staking/src/Actions/partials/Validate.tsx#L53
    const COMM_MUL = 10000000;
    const commission = +process.env.REWARD_COMMISSION * COMM_MUL;
    const transaction = this.api.tx.staking.validate({
      commission,
    });

    return new Promise((res, rej) => {
      transaction
        .signAndSend(
          this.controllerAccount,
          this.sendStatusCb.bind(this, res, rej, undefined)
        )
        .catch((err) => rej(err));
    });
  }

  private sendStatusCb(
    res,
    rej,
    {
      events = [],
      status,
    }: {
      events?: EventRecord[];
      status: ExtrinsicStatus;
    }
  ) {
    if (status.isInvalid) {
      console.info("Transaction invalid");
      rej("Transaction invalid");
    } else if (status.isReady) {
      console.info("Transaction is ready");
    } else if (status.isBroadcast) {
      console.info("Transaction has been broadcasted");
    } else if (status.isInBlock) {
      const hash = status.asInBlock.toHex();
      console.info(`Transaction is in block: ${hash}`);
    } else if (status.isFinalized) {
      const hash = status.asFinalized.toHex();
      console.info(`Transaction has been included in blockHash ${hash}`);
      events.forEach(({ event }) => {
        if (event.method === "ExtrinsicSuccess") {
          console.info("Transaction succeeded");
        } else if (event.method === "ExtrinsicFailed") {
          console.info("Transaction failed");
          throw new Error("Transaction failed");
        }
      });

      res(hash);
    }
  }
}

async function main() {
  const validator = new Validator();
  await validator.init();
  await validator.loadAccounts();
  await validator.generateSessionKey();
  await validator.addValidator();
  await validator.setSessionKey();
  await validator.setCommission();

  console.log("Validator added successfully!");
}

main()
  .catch(console.error)
  .finally(() => process.exit());
