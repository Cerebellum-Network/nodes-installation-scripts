import Accounts from "./accounts";
import Network from "./network";

class Validator {
  private stashAccount: any;
  private controllerAccount: any;
  private sessionKey;
  private stashBalance: string;
  private controllerBalance: string;

  constructor(
    private readonly config: any,
    private readonly network: Network,
    private readonly accounts: Accounts
  ) { }

  /**
   * Load stash and controller accounts.
   */
  public async loadAccounts(stashMnemonic: string, controllerMnemonic: string) {
    console.log(`Loading your stash and controller accounts\n`);
    this.stashAccount = await this.accounts.loadAccount(stashMnemonic);
    this.controllerAccount = await this.accounts.loadAccount(controllerMnemonic);
    this.stashBalance = await this.network.getBalance(this.stashAccount.address);
    this.controllerBalance = await this.network.getBalance(this.controllerAccount.address);
    console.log(`Stash Account is ${this.stashAccount.address} and balance is ${this.stashBalance}`);
    console.log(`Controller Account is ${this.controllerAccount.address} and balance is ${this.controllerBalance}\n`);
  }

  /**
   * Generate session key
   */
  public async generateSessionKey() {
    console.log(`\nGenerating Session Key`);
    this.sessionKey = await this.network.api.rpc.author.rotateKeys();
    console.log(`Session Key: ${this.sessionKey}`);
  }

  /**
   * Add validator to the node
   * @param bondValue The amount to be stashed
   * @param payee The rewards destination account
   */
  public addValidator(bondValue: number) {
    console.log(`\nAdding validator`);
    console.log(`Bond value is ${bondValue}`);
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
        .signAndSend(this.stashAccount, Network.sendStatusCb.bind(this, res, rej))
        .catch((err) => rej(err));
    });
  }

  public async setController() {
    console.log(`\n Setting controller account`);
    const transaction = this.network.api.tx.staking.setController(
      this.controllerAccount.address
    );

    return new Promise((res, rej) => {
      transaction
        .signAndSend(this.stashAccount, Network.sendStatusCb.bind(this, res, rej))
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
    const transaction = this.network.api.tx.session.setKeys(
      this.sessionKey,
      EMPTY_PROOF
    );

    return new Promise((res, rej) => {
      transaction
        .signAndSend(
          this.controllerAccount,
          Network.sendStatusCb.bind(this, res, rej)
        )
        .catch((err) => rej(err));
    });
  }

  /**
   * set rewards commission
   * @param REWARD_COMMISSION rewards commission
   */
  public async setCommission(commissionValue: number) {
    console.log(`\nSetting reward commission`);
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
          Network.sendStatusCb.bind(this, res, rej)
        )
        .catch((err) => rej(err));
    });
  }
}

export default Validator;