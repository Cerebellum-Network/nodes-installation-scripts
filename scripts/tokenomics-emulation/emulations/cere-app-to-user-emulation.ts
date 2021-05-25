import { IEmulation } from "./emulation.interface";
import Accounts from "../accounts";
import CereSmartContract from "../cere-smart-contract";
import Network from "../network";
import Batcher from "./batcher";

class CereAppToUserEmulation implements IEmulation {
  constructor(
    private readonly config,
    private readonly account: Accounts,
    private readonly network: Network,
    private readonly cereContract: CereSmartContract,
    private readonly batcher: Batcher
  ) {}

  public async run(): Promise<void> {
    console.log(`Running emulation for app to user cere token transfer`);
    const sender = this.account.rootAccount;
    const total = +this.config.amount;
    await this.batcher.batchProcessing(
      sender,
      this.network,
      total,
      async () => {
        const destination = await this.account.generateSrAccount();
        const tokenValue = this.config.token_value;
        const txnFee = this.config.txn_fee;
        const sendTxn = await this.cereContract.transfer(
          sender,
          destination.ss58Address,
          tokenValue,
          txnFee
        );
      }
    );
  }
}

export default CereAppToUserEmulation;
