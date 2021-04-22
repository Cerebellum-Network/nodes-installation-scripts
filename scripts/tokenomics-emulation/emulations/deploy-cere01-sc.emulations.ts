import { IEmulation } from "./emulation.interface";
import Accounts from "../accounts";
import CereSmartContract from "../cere-smart-contract";

class DeployCereScEmulation implements IEmulation {
  constructor(
    private readonly account: Accounts,
    private readonly cereContract: CereSmartContract,
  ) {}

  public async run(): Promise<void> {
    console.log(`Running emulation for deploy smart contract`);
    const sender = this.account.rootAccount;
    const deploy = await this.cereContract.bluePrint(sender);
  }
}

export default DeployCereScEmulation;
