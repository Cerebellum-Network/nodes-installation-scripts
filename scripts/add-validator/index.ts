import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import { KeypairType } from "@polkadot/util-crypto/types";
import { KeyringPair } from "@polkadot/keyring/types";
import config from "./network-custom-types";
import * as dotenv from "dotenv";
import { Validator } from "../common/add-validator";
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

  /**
   * Load stash and controller accounts.
   */
  public async loadAccounts() {
    console.log(`Loading your accounts`);
    const keyring = new Keyring({ type: "sr25519" });
    this.stashAccount = keyring.addFromMnemonic(process.env.STASH_ACCOUNT_MNEMONIC);
    this.controllerAccount = keyring.addFromMnemonic(process.env.CONTROLLER_ACCOUNT_MNEMONIC);
  }

  /**
   * add validator
   */
  public async addValidator() {
    const decimal = +process.env.DECIMAL;
    const bondValue = +process.env.BOND_VALUE * 10 ** decimal;
    const rewardCommission = +process.env.REWARD_COMMISSION
    const validator = new Validator();

    // Fetch account balance
    const { stashBalance, controllerBalance } = await validator.accountBalance(this.api, this.stashAccount.address, this.controllerAccount.address);
    console.log(`The stash account ${this.stashAccount.address} balance is ${stashBalance}`);
    console.log(`The controller account ${this.controllerAccount.address} balance is ${controllerBalance}`);

    // Generate session key
    const sessionKey = await validator.generateSessionKey(this.api);
    console.log(`The session key is ${sessionKey}`);

    // compare stash balance with bond value
    if (stashBalance <= Number(bondValue)) {
      throw new Error("Bond value needs to be lesser than stash account balance.");
    }

    // bond token of stash account
    const bondStashAccount = await validator.bondValue(this.api, this.controllerAccount.address, this.stashAccount, bondValue);

    // set session key
    const setSessionKey = await validator.setSessionKey(this.api, sessionKey, this.controllerAccount);

    // set reward commission
    const reward = await validator.setCommission(this.api, rewardCommission, this.controllerAccount);
  }
}

async function main() {
  const addValidator = new AddValidator();
  await addValidator.init();
  await addValidator.loadAccounts();
  await addValidator.addValidator();
  console.log("Validator added successfully!");
}

main()
  .catch(console.error)
  .finally(() => process.exit());
