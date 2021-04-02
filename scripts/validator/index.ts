import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import { mnemonicGenerate, decodeAddress } from "@polkadot/util-crypto";
import { KeypairType } from "@polkadot/util-crypto/types";
import { KeyringPair } from "@polkadot/keyring/types";
import { EventRecord, ExtrinsicStatus } from "@polkadot/types/interfaces";
import * as dotenv from "dotenv";
import * as BN from 'bn.js';
import axios from 'axios';

const MNEMONIC_WORDS_COUNT = 12;

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
    this.api = await ApiPromise.create({ provider: wsProvider });
    await this.api.isReady;
    const chain = await this.api.rpc.system.chain();
    console.log(`Connected to: ${chain}\n`);

    console.log("Check if syncing...");
    await this.callWithRetry(this.isSyncing.bind(this), {
      maxDepth: 100,
    });
    console.log("Sync is complete!");
  }
  
  private async isSyncing() {
    const response = await this.api.rpc.system.health();

        if (response.isSyncing.valueOf()) {
      throw new Error("Node is syncing")
    }
  }

  public async createAccounts() {
    console.log('Creating Stash and Controller accounts');

    this.stashAccount = this.generateAccount("Stash");
    console.log(`Stash account public key: ${this.stashAccount.address}`);
    this.controllerAccount = this.generateAccount("Controller");
    console.log(`Controller account public key ${this.controllerAccount.address}`);

    const stashAssetsResponse = await this.requestAssets(this.stashAccount);
    console.log('Stash assets transaction:', stashAssetsResponse?.data);

    const controllerAssetsResponse = await this.requestAssets(this.controllerAccount);
    console.log('Controller assets transaction:', controllerAssetsResponse?.data);

    await this.callWithRetry(this.isValidBalance.bind(this)); 

    console.log(
      `Your Stash Account is ${this.stashAccount.address} and balance is ${this.stashBalance}`
    );
    console.log(
      `Your Controller Account is ${this.controllerAccount.address} and balance is ${this.controllerBalance}\n`
    );
  }

  /**
   * Load stash and controller accounts.
   */
  public async loadAccounts() {
    console.log(`Loading your accounts`);
    const keyring = new Keyring({ type: "sr25519" });
    this.stashAccount = keyring.addFromJson(
      JSON.parse(process.env.STASH_ACCOUNT_JSON)
    );
    this.stashAccount.decodePkcs8(process.env.STASH_ACCOUNT_PASSWORD);
    this.controllerAccount = keyring.addFromJson(
      JSON.parse(process.env.CONTROLLER_ACCOUNT_JSON)
    );
    this.controllerAccount.decodePkcs8(process.env.CONTROLLER_ACCOUNT_PASSWORD);
    this.stashBalance = await this.getBalance(this.stashAccount)
    this.controllerBalance = await this.getBalance(this.controllerAccount)

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
      'Stash'
    );

    return new Promise((res, rej) => {
      transaction.signAndSend(this.stashAccount, this.sendStatusCb.bind(this, res, rej))
        .catch((err) => rej(err));
    });

  }

  public async setController() {
    console.log(`\n Setting controller account`);
    const transaction = this.api.tx.staking.setController(this.controllerAccount.address);

    return new Promise((res, rej) => {
      transaction.signAndSend(this.stashAccount, this.sendStatusCb.bind(this, res, rej))
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
      transaction.signAndSend(this.controllerAccount, this.sendStatusCb.bind(this, res, rej))
        .catch((err) => rej(err));
    });
  }

  /**
   * set rewards commission
   * @param REWARD_COMMISSION rewards commission
   */
  public async setCommission() {
    console.log(`\nSetting reward commission`);
    const transaction = this.api.tx.staking.validate({
      commission: process.env.REWARD_COMMISSION,
    });

    return new Promise((res, rej) => {
      transaction.signAndSend(this.controllerAccount, this.sendStatusCb.bind(this, res, rej))
        .catch((err) => rej(err));
    });
  }

  public getNetworkName() {
    return process.env.NETWORK.toUpperCase().replace("-", "_");
  }

  private generateAccount(type: string) {
    const keyring = new Keyring({ type: "sr25519", ss58Format: 2 });
    const mnemonic = mnemonicGenerate(MNEMONIC_WORDS_COUNT);
    const pair = keyring.addFromUri(mnemonic, {}, "ed25519");

    console.log('=====================================================');
    console.log(`GENERATED ${MNEMONIC_WORDS_COUNT}-WORD MNEMONIC SEED (${type}):`);
    console.log(mnemonic);
    console.log('=====================================================');

    return keyring.addPair(pair);
  }

  private async requestAssets(account: KeyringPair) {
    try {
      return await axios.post(
        process.env.REQUEST_ASSETS_ENDPOINT,
        { destination: account.address, network: this.getNetworkName() },
        {
          timeout: 50000,
          withCredentials: false,
          headers: {
            Accept: "application/json",
          },
        }
      );
    } catch(err) {
      console.log('Error requesting assets:', err.message)
      console.log(err.response.data)
      throw err;
    }
  }

  private async isValidBalance () {
    console.log('Requesting balance');
    this.stashBalance = await this.getBalance(this.stashAccount);
    this.controllerBalance = await this.getBalance(this.controllerAccount); 

    if (this.stashBalance <= 0) {
      throw new Error('Stash balance should be above 0');
    }
  }

  private async getBalance(account: KeyringPair) {
    const result = await this.api.query.system.account(account.address);
    const {
      data: { free: balance },
    } = result;

    return Number(balance);
  }

  private async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async callWithRetry(fn, options = { maxDepth: 5}, depth = 0) {
    try {
      return await fn();
    } catch (e) {
      if (depth > options.maxDepth) {
        throw e;
      }
      const seconds = parseInt(process.env.WAIT_SECONDS, 10);
      console.log(`Wait ${seconds}s.`);
      await this.sleep(seconds * 1000);
    
      return this.callWithRetry(fn, options, depth + 1);
    }
  }

  private sendStatusCb(res, rej, {
    events = [],
    status,
  }: {
    events?: EventRecord[];
    status: ExtrinsicStatus;
  }) {
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
      console.info(
        `Transaction has been included in blockHash ${hash}`
      );

      if (events?.length) {
        events.forEach(({ event }) => {
          if (event.method === "ExtrinsicSuccess") {
            console.info("Transaction succeeded");
          } else if (event.method === "ExtrinsicFailed") {
            console.info("Transaction failed");
            throw new Error("Transaction failed");
          }
        });
      }

      res(hash);
    }
  }
}

async function main() {
  const validator = new Validator();
  await validator.init();
  if (Boolean(process.env.GENERATE_ACCOUNTS) && validator.getNetworkName().startsWith("TESTNET")) {
    await validator.createAccounts();
  } else {
    await validator.loadAccounts();
  }
  await validator.generateSessionKey();
  // await validator.setController();
  await validator.addValidator();
  await validator.setSessionKey();
  await validator.setCommission();

  console.log('Validator added successfully!');
}

main()
  .catch(console.error)
  .finally(() => process.exit());
