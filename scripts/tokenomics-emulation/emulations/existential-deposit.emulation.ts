import { IEmulation } from "./emulation.interface";
import Network from "../network";
import Accounts from "../accounts";

class ExistentialDepositEmulation implements IEmulation {
  constructor(
    private readonly config,
    private readonly network: Network,
    private readonly account: Accounts
  ) {}

  public async run(): Promise<void> {
    for (let i = 1; i <= this.config.amount; i++) {
      console.log(`Running ${i} existential deposit...\n`);
      const destination = await this.account.generateSrAccount();
      const sender = this.account.sudoAccount;
      const transferAmount = this.network.existentialDeposit();
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

export default ExistentialDepositEmulation;
