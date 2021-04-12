import { IEmulation } from "./emulation.interface";
import Network from '../network';
import _ from "lodash";

class NativeTokensTransferEmulation implements IEmulation {
  constructor(private readonly config, private readonly network: Network) {}

  public async run(): Promise<void> {
    for (let i = 1; i <= this.config.amount; i++) {
      console.log(`\nRunning ${i} native token transfer...`);
      const account = await this.network.generateSrAccount();
      const transferAmount = _.random(
        this.config.tokens_range[0],
        this.config.tokens_range[1]
      );
      const transfer = await this.network.transfer(
        account.ss58Address,
        transferAmount.toString()
      );
      const balance = await this.network.getBalance(account.ss58Address);
      console.log(`Balance of ${account.ss58Address} is ${balance}`);
    }
  }
}

export default NativeTokensTransferEmulation;