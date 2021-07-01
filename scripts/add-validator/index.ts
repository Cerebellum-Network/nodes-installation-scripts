import { mnemonicGenerate } from "@polkadot/util-crypto";
import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import { KeypairType } from "@polkadot/util-crypto/types";
import { KeyringPair } from "@polkadot/keyring/types";
import config from "../common/network-custom-types";
import * as dotenv from "dotenv";
import { Validator } from "../common/add-validator";
import axios from 'axios';
dotenv.config();

class AddValidator {
  private api: ApiPromise;
  private keyRingType: KeypairType;
  private stashAccount: KeyringPair;
  private controllerAccount: KeyringPair;

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

  public async syncNode(): Promise<void> {
    const validator = new Validator();
    return await validator.start(this.api, process.env.WAIT_SECONDS);
  }

  /**
   * Load stash and controller accounts.
   */
  public async loadAccounts() {
    console.log(`Loading your accounts`);
    const keyring = new Keyring({ type: "sr25519" });
    this.stashAccount = keyring.addFromMnemonic(
      process.env.STASH_ACCOUNT_MNEMONIC
    );
    this.controllerAccount = keyring.addFromMnemonic(
      process.env.CONTROLLER_ACCOUNT_MNEMONIC
    );
  }

  /**
   * add validator
   */
  public async addValidator() {
    const decimal = +process.env.DECIMAL;
    const bondValue = +process.env.BOND_VALUE * 10 ** decimal;
    const rewardCommission = +process.env.REWARD_COMMISSION;
    const validator = new Validator();

    // Fetch account balance
    const { stashBalance, controllerBalance } = await validator.accountBalance(
      this.api,
      this.stashAccount.address,
      this.controllerAccount.address
    );
    console.log(
      `The stash account ${this.stashAccount.address} balance is ${stashBalance}`
    );
    console.log(
      `The controller account ${this.controllerAccount.address} balance is ${controllerBalance}`
    );

    // Generate session key
    const sessionKey = await validator.generateSessionKey(this.api);
    console.log(`The session key is ${sessionKey}`);

    // compare stash balance with bond value
    if (stashBalance <= Number(bondValue)) {
      throw new Error(
        "Bond value needs to be lesser than stash account balance."
      );
    }

    // bond token of stash account
    const bondStashAccount = await validator.bondValue(
      this.api,
      this.controllerAccount.address,
      this.stashAccount,
      bondValue
    );

    // set session key
    const setSessionKey = await validator.setSessionKey(
      this.api,
      sessionKey,
      this.controllerAccount
    );

    // set reward commission
    const reward = await validator.setCommission(
      this.api,
      rewardCommission,
      this.controllerAccount
    );
  }

  public async createAccounts() {
    console.log("Creating Stash and Controller accounts");
    const testNetwork = process.env.TEST_NETWORKS;

    if (!testNetwork.includes(process.env.NETWORK)) {
      throw new Error("Couldn't create new account for Mainnet");
    }
    this.stashAccount = this.generateAccount("Stash");
    this.controllerAccount = this.generateAccount("Controller");

    const stashAssetsResponse = await this.requestAssets(this.stashAccount);
    console.log("Stash assets transaction:", stashAssetsResponse?.data);

    const controllerAssetsResponse = await this.requestAssets(
      this.controllerAccount
    );
    console.log(
      "Controller assets transaction:",
      controllerAssetsResponse?.data
    );

    await this.callWithRetry(this.isValidBalance.bind(this));

    const validator = new Validator();
    // Fetch account balance
    const { stashBalance, controllerBalance } = await validator.accountBalance(
      this.api,
      this.stashAccount.address,
      this.controllerAccount.address
    );
    console.log(
      `The stash account ${this.stashAccount.address} balance is ${stashBalance}`
    );
    console.log(
      `The controller account ${this.controllerAccount.address} balance is ${controllerBalance}`
    );
  }

  private generateAccount(type: string) {
    const mnemonic = mnemonicGenerate(12);
    const keyring = new Keyring({ type: "sr25519" });
    const pair = keyring.addFromMnemonic(
      mnemonic
    );

    console.log("=====================================================");
    console.log(`GENERATED 12-WORD MNEMONIC SEED (${type}):`);
    console.log(mnemonic);
    console.log("=====================================================");

    return keyring.addPair(pair);
  }

  private async requestAssets(account: KeyringPair) {
    try {
      const network = process.env.NETWORK;
      return await axios.post(
        process.env.REQUEST_ASSETS_ENDPOINT,
        { destination: account.address, network: network.toUpperCase() },
      );
    } catch (err) {
      console.log("Error requesting assets:", err.message);
      console.log(err.response.data);
      throw err;
    }
  }

  private async isValidBalance() {
    console.log("Requesting balance");
    const validator = new Validator();
    // Fetch account balance
    const { stashBalance, controllerBalance } = await validator.accountBalance(
      this.api,
      this.stashAccount.address,
      this.controllerAccount.address
    );
    if (stashBalance <= 0 && controllerBalance <=0) {
      throw new Error("Stash  and Controller balance should be above 0");
    }
  }

  private async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async callWithRetry(fn, options = { maxDepth: 5 }, depth = 0) {
    try {
      return await fn();
    } catch (e) {
      if (depth > options.maxDepth) {
        throw e;
      }
      const time = 2 ** depth * 1000;
      console.log(`Wait ${time / 1000}s.`);
      await this.sleep(time);

      return this.callWithRetry(fn, options, depth + 1);
    }
  }
}

async function main() {
  const addValidator = new AddValidator();
  await addValidator.init();
  await addValidator.syncNode();
  if (Boolean(process.env.GENERATE_ACCOUNTS)) {
    await addValidator.createAccounts();
  } else {
    await addValidator.loadAccounts();
  }
  await addValidator.addValidator();
  console.log("Validator added successfully!");
}

main()
  .catch(console.error)
  .finally(() => process.exit());
