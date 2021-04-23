import { KeyringPair } from "@polkadot/keyring/types";
import Accounts from "./accounts";
import Network from "./network";

class Validator {
  private stashAccount: any;
  private controllerAccount: any;
  private sessionKey;
  private stashBalance: string;
  private controllerBalance: string;

  constructor(
    private readonly network: Network,
    private readonly accounts: Accounts,
    private readonly decimals: number
  ) { }

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
  public async loadAccounts(stashAccount: KeyringPair, controllerAccount: KeyringPair) {
    console.log(`Loading your stash and controller accounts\n`);
    this.stashAccount = stashAccount;
    this.controllerAccount = controllerAccount;
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
   * Generate session key
   */
  public async generateSessionKey() {
    console.log(`Generating Session Key\n`);
    this.sessionKey = await this.network.api.rpc.author.rotateKeys();
    console.log(`Session Key: ${this.sessionKey}`);
  }

  /**
   * Add validator to the node
   * @param bondValue The amount to be stashed
   * @param payee The rewards destination account
   */
  public addValidator(bondValue: number) {
    console.log(`Adding validator\n`);
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
          Network.sendStatusCb.bind(this, res, rej, undefined)
        )
        .catch((err) => rej(err));
    });
  }

  public async setController() {
    console.log(`Setting controller account\n`);
    const transaction = this.network.api.tx.staking.setController(
      this.controllerAccount.address
    );

    return new Promise((res, rej) => {
      transaction
        .signAndSend(
          this.stashAccount,
          Network.sendStatusCb.bind(this, res, rej, undefined)
        )
        .catch((err) => rej(err));
    });
  }

  /**
   * Set session key
   * @param sessionKey session key
   */
  public async setSessionKey() {
    console.log(`Setting session key\n`);
    const EMPTY_PROOF = new Uint8Array();
    const transaction = this.network.api.tx.session.setKeys(
      this.sessionKey,
      EMPTY_PROOF
    );

    return new Promise((res, rej) => {
      transaction
        .signAndSend(
          this.controllerAccount,
          Network.sendStatusCb.bind(this, res, rej, undefined)
        )
        .catch((err) => rej(err));
    });
  }

  /**
   * set rewards commission
   * @param REWARD_COMMISSION rewards commission
   */
  public async setCommission(commissionValue: number) {
    console.log(`Setting reward commission\n`);
    // https://github.com/polkadot-js/apps/blob/23dad13c9e67de651e5551e4ce7cba3d63d8bb47/packages/page-staking/src/Actions/partials/Validate.tsx#L53
    const COMM_MUL = 10000000;
    const commission = commissionValue * COMM_MUL;
    const transaction = this.network.api.tx.staking.validate({
      commission,
    });

    return new Promise((res, rej) => {
      transaction
        .signAndSend(
          this.controllerAccount,
          Network.sendStatusCb.bind(this, res, rej, undefined)
        )
        .catch((err) => rej(err));
    });
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

export default Validator;
