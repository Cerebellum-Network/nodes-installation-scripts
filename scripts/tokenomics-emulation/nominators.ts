import Accounts from "./accounts";
import Network from "./network";
import fs from "fs";

class Nominator {
  private stashAccount: any;
  private controllerAccount: any;
  private stashBalance: string;
  private controllerBalance: string;

  constructor(
    private readonly network: Network,
    private readonly accounts: Accounts,
    private readonly decimals: number
  ) {}

  /**
   * wait till node sync
   * @param waitSeconds wait seconds
   */
  public async start(waitSeconds: string) {
    console.log("Check if syncing...");
    await this.callWithRetry(
      this.isSyncing.bind(this),
      {
        maxDepth: 100,
      },
      0,
      waitSeconds
    );
    console.log("Sync is complete!");
  }

  /**
   * Load stash and controller accounts.
   */
  public async loadAccounts(stashMnemonic: string, controllerMnemonic: string) {
    console.log(`Loading your stash and controller accounts\n`);
    this.stashAccount = await this.accounts.loadAccount(stashMnemonic);
    this.controllerAccount = await this.accounts.loadAccount(
      controllerMnemonic
    );
    this.stashBalance = await this.network.getBalance(
      this.stashAccount.address
    );
    this.controllerBalance = await this.network.getBalance(
      this.controllerAccount.address
    );
    console.log(
      `Stash Account is ${this.stashAccount.address} and balance is ${this.stashBalance}`
    );
    console.log(
      `Controller Account is ${this.controllerAccount.address} and balance is ${this.controllerBalance}\n`
    );
  }

  /**
   * Add validator to the node
   * @param bondValue The amount to be stashed
   * @param payee The rewards destination account
   */
  public addNominator(bondValue: number) {
    console.log(`Adding Nominator\n`);
    console.log(`Bond value is ${bondValue}`);
    const value = bondValue * 10 ** this.decimals;
    if (+this.stashBalance <= Number(bondValue)) {
      throw new Error("Bond value needs to be lesser than balance.");
    }

    const transaction = this.network.api.tx.staking.bond(
      this.controllerAccount.address,
      BigInt(bondValue),
      "Staked"
    );

    return new Promise((res, rej) => {
      transaction
        .signAndSend(
          this.stashAccount,
          Network.sendStatusCb.bind(this, res, rej)
        )
        .catch((err) => rej(err));
    });
  }

  /**
   * Set controller to the stash account
   * @returns hash
   */
  public async setController() {
    console.log(`Setting controller account\n`);
    const transaction = this.network.api.tx.staking.setController(
      this.controllerAccount.address
    );

    return new Promise((res, rej) => {
      transaction
        .signAndSend(
          this.stashAccount,
          Network.sendStatusCb.bind(this, res, rej)
        )
        .catch((err) => rej(err));
    });
  }

  /**
   * Nominate for validators
   * @param validators Array of validators id
   * @returns hash
   */
  public async nominate(validators: string[]) {
    console.log(`Nominating validators\n`);
    const txn = await this.network.api.tx.staking.nominate(validators);
    return new Promise((res, rej) => {
      txn
        .signAndSend(
          this.stashAccount,
          Network.sendStatusCb.bind(this, res, rej)
        )
        .catch((err) => rej(err));
    });
  }

  /**
   * Fetch current active validators.
   * @returns validators list
   */
  public async fetchValidators(validatorsCount: number) {
    console.log(`Fetch validators`);
    let validators = [];
    for (let validator = 1; validator <= validatorsCount; validator++) {
      const stashAccountFile = fs.readFileSync(
        `../generate-accounts/accounts/all/validator-${validator}-stash`
      );
      const stashAccountAddress = JSON.parse(stashAccountFile.toString())
        .ss58Address;
      validators.push(stashAccountAddress);
    }
    return validators;
  }

  /**
   * Check if node is syning or synced.
   */
  private async isSyncing() {
    const response = await this.network.api.rpc.system.health();
    if (response.isSyncing.valueOf()) {
      throw new Error("Node is syncing");
    }
  }

  /**
   * Function to be looped
   * @param fn function which needs to be looped
   * @param options
   * @param depth
   * @returns
   */
  private async callWithRetry(
    fn,
    options = { maxDepth: 5 },
    depth = 0,
    waitSeconds: string
  ) {
    try {
      return await fn();
    } catch (e) {
      if (depth > options.maxDepth) {
        throw e;
      }
      const seconds = parseInt(waitSeconds, 10);
      console.log(`Wait ${seconds}s.`);
      await this.sleep(15 * 1000);

      return this.callWithRetry(fn, options, depth + 1, waitSeconds);
    }
  }

  /**
   * Sleep
   * @param ms Time in milli second
   * @returns promise
   */
  private async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default Nominator;
