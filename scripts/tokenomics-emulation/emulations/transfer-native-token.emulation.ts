import { IEmulation } from "./emulation.interface";
import Network from "../network";
import Accounts from "../accounts";
import _ from "lodash";
import Batcher from "./batcher";

class NativeTokensTransferEmulation implements IEmulation {
  constructor(
    private readonly config,
    private readonly batchCount,
    private readonly network: Network,
    private readonly account: Accounts
  ) {}

  public async run(): Promise<void> {
    const batcher = new Batcher();
    const sender = this.account.rootAccount;
    const total = +this.config.amount;
    await batcher.batchProcessing(
      sender,
      this.network,
      total,
      this.batchCount,
      async () => {
        const sender = this.account.rootAccount;
        const destination = await this.account.generateSrAccount();
        const transferAmount = _.random(
          this.config.tokens_range[0],
          this.config.tokens_range[1]
        );
        const transfer = await this.network.transfer(
          sender,
          destination.ss58Address,
          transferAmount.toString()
        );
      }
    );
  }
}

export default NativeTokensTransferEmulation;
