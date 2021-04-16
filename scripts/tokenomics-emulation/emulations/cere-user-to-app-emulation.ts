import { IEmulation } from "./emulation.interface";
import Accounts from "../accounts";
import CereSmartContract from "../cere-smart-contract";
import Network from "../network";
import Batcher from "./batcher";

class CereUserToAppEmulation implements IEmulation {
  constructor(
    private readonly config,
    private readonly account: Accounts,
    private readonly network: Network,
    private readonly cereContract: CereSmartContract,
    private readonly batcher: Batcher
  ) {}

  public async run(): Promise<void> {
    console.log(`Running emulation for user to app cere token transfer`);
    const sender = this.account.rootAccount;
    const total = +this.config.amount;
    await this.batcher.batchProcessing(
      sender,
      this.network,
      total,
      async () => {
        const destination = await this.account.generateSrAccount();
        const tokenValue = await this.config.token_value;
        const txnFee = await this.cereContract.estimateTxnFee(
          sender,
          destination.ss58Address,
          tokenValue
        );
        const sendTxn = await this.cereContract.transfer(
          sender,
          destination.ss58Address,
          tokenValue,
          txnFee.toString()
        );
      }
    );
  }
}

export default CereUserToAppEmulation;
