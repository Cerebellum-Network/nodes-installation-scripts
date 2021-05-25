import { IEmulation } from "./emulation.interface";
import Network from "../network";
import Accounts from "../accounts";
import Batcher from "./batcher";

class ExistentialDepositEmulation implements IEmulation {
  constructor(
    private readonly config,
    private readonly network: Network,
    private readonly account: Accounts,
    private readonly batcher: Batcher
  ) {}

  public async run(): Promise<void> {
    const sender = this.account.rootAccount;
    const total = +this.config.amount;
    await this.batcher.batchProcessing(
      sender,
      this.network,
      total,
      async () => {
        const destination = await this.account.generateSrAccount();
        const transferAmount = this.network.existentialDeposit();
        const transfer = await this.network.transfer(
          sender,
          destination.ss58Address,
          transferAmount.toString()
        );
      }
    );
  }
}

export default ExistentialDepositEmulation;
