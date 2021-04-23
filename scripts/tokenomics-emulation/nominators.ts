import { KeyringPair } from "@polkadot/keyring/types";
import Network from "./network";

class Nominator {

  constructor(
    private readonly network: Network,
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
   * Add validator to the node
   * @param bondValue The amount to be stashed
   * @param payee The rewards destination account
   */
  public addNominator(
    bondValue: number,
    controllerAccount: KeyringPair,
    stashAccount: KeyringPair,
    stashBalance: number
  ) {
    console.log(`Adding Nominator\n`);
    console.log(`Bond value is ${bondValue}`);
    const value = bondValue * 10 ** this.decimals;
    if (stashBalance <= Number(bondValue)) {
      throw new Error("Bond value needs to be lesser than balance.");
    }

    const transaction = this.network.api.tx.staking.bond(
      controllerAccount.address,
      BigInt(bondValue),
      "Staked"
    );

    return new Promise((res, rej) => {
      transaction
        .signAndSend(stashAccount, Network.sendStatusCb.bind(this, res, rej, undefined))
        .catch((err) => rej(err));
    });
  }

  /**
   * Set controller to the stash account
   * @returns hash
   */
  public async setController(
    controllerAccount: KeyringPair,
    stashAccount: KeyringPair
  ) {
    console.log(`Setting controller account\n`);
    const transaction = this.network.api.tx.staking.setController(
      controllerAccount.address
    );

    return new Promise((res, rej) => {
      transaction
        .signAndSend(stashAccount, Network.sendStatusCb.bind(this, res, rej, undefined))
        .catch((err) => rej(err));
    });
  }

  /**
   * Nominate for validators
   * @param validators Array of validators id
   * @returns hash
   */
  public async nominate(validators: string[], stashAccount: KeyringPair) {
    console.log(`Nominating validators\n`);
    const txn = await this.network.api.tx.staking.nominate(validators);
    return new Promise((res, rej) => {
      txn
        .signAndSend(stashAccount, Network.sendStatusCb.bind(this, res, rej, undefined))
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
      await this.sleep(seconds);

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
