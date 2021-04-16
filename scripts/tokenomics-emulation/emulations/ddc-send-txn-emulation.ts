import { IEmulation } from "./emulation.interface";
import Network from "../network";
import Accounts from "../accounts";
import Batcher from "./batcher";

class SendDdcTxnEmulation implements IEmulation {
  constructor(
    private readonly config,
    private readonly network: Network,
    private readonly account: Accounts,
    private readonly batcher: Batcher
  ) {}

  public async run(): Promise<void> {
    console.log(`Running emulation for send ddc transaction`);
    const sender = this.account.rootAccount;
    const total = +this.config.amount;
    await this.batcher.batchProcessing(
      sender,
      this.network,
      total,
      async () => {
        const destination = await this.account.generateSrAccount();
        const sendData = this.config.sendData;
        const sendTxn = await this.network.sendDDC(
          sender,
          destination.ss58Address,
          sendData
        );
      }
    );
  }
}

export default SendDdcTxnEmulation;
