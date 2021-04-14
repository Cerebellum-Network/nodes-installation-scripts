import { IEmulation } from "./emulation.interface";
import Accounts from "../accounts";
import CereSmartContract from "../cere-smart-contract";

class CereUserToAppEmulation implements IEmulation {
  constructor(
    private readonly config,
    private readonly account: Accounts,
    private readonly cereContract: CereSmartContract
  ) {}

  public async run(): Promise<void> {
    for (let i = 1; i <= this.config.amount; i++) {
      console.log(`Running ${i} cere user to app transfer...\n`);
      const sender = this.account.sudoAccount;
      const destination = await this.account.generateSrAccount();
      const tokenValue = await this.config.token_value;
      const txnFee = await this.cereContract.estimateTxnFee(sender, destination.ss58Address, tokenValue);
      const sendTxn = await this.cereContract.transfer(
        sender,
        destination.ss58Address,
        tokenValue,
        txnFee.toString()
      );
    }
  }
}

export default CereUserToAppEmulation;
