import { IEmulation } from "./emulation.interface";
import Network from "../network";
import Accounts from "../accounts";
import _ from "lodash";

class NativeTokensTransferEmulation implements IEmulation {
  constructor(
    private readonly config,
    private readonly network: Network,
    private readonly account: Accounts
  ) {}

  public async run(): Promise<void> {
    for (let i = 1; i <= this.config.amount; i++) {
      console.log(`\nRunning ${i} native token transfer...`);
      const destination = await this.network.generateSrAccount();
      const transferAmount = _.random(
        this.config.tokens_range[0],
        this.config.tokens_range[1]
      );
      const sender = this.account.sudoAccount;
      const transfer = await this.network.transfer(
        sender,
        destination.ss58Address,
        transferAmount.toString()
      );
      const balance = await this.network.getBalance(destination.ss58Address);
      console.log(`Balance of ${destination.ss58Address} is ${balance}`);
    }
  }
}

export default NativeTokensTransferEmulation;
