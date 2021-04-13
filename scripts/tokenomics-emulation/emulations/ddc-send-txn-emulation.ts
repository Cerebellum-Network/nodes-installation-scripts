import { IEmulation } from "./emulation.interface";
import Network from "../network";
import Accounts from "../accounts";

class SendDdcTxnEmulation implements IEmulation {
  constructor(
    private readonly config,
    private readonly network: Network,
    private readonly account: Accounts
  ) {}

  public async run(): Promise<void> {
    for (let i = 1; i <= this.config.amount; i++) {
      console.log(`Running ${i} send ddc transaction...\n`);
      const destination = await this.account.generateSrAccount();
      const sender = this.account.sudoAccount;
      const sendData = this.config.sendData;
      const sendTxn = await this.network.sendDDC(
        sender,
        destination.ss58Address,
        sendData
      );
    }
  }
}

export default SendDdcTxnEmulation;
