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
      console.log(this.config);
      console.log(`Running ${i} existential deposit...\n`);
      const destination = await this.account.generateSrAccount();
      const sender = this.account.sudoAccount;
      const transferAmount = this.network.existentialDeposit();
      console.log(sender.address);
      console.log(transferAmount);
      const transfer = await this.network.transfer(
        sender,
        '5EHG8yMxHBLPeK2Uyw9cnrdC3RY2yCa8qkwvHS7PLazErXfE',
        transferAmount.toString()
      );
      const balance = await this.network.getBalance('5EHG8yMxHBLPeK2Uyw9cnrdC3RY2yCa8qkwvHS7PLazErXfE');
      console.log(`Balance of ${destination.ss58Address} is ${balance}`);
    }
  }
}

export default ExistentialDepositEmulation;
