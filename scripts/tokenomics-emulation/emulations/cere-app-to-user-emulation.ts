import { IEmulation } from "./emulation.interface";
import Accounts from "../accounts";
import CereSmartContract from "../cere-smart-contract";

class CereApptoUserEmulation implements IEmulation {
  constructor(
    private readonly config,
    private readonly account: Accounts,
    private readonly cereContract: CereSmartContract
  ) {}

  public async run(): Promise<void> {
    for (let i = 1; i <= this.config.amount; i++) {
      console.log(`Running ${i} cere app to user transfer...\n`);
      const sender = this.account.sudoAccount;
      const destination = await this.account.generateSrAccount();
      const tokenValue = await this.config.token_value;
      const txnFee = await this.config.txn_fee;
      const sendTxn = await this.cereContract.transfer(
        sender,
        destination.ss58Address,
        tokenValue,
        txnFee
      );
    }
  }
}

export default CereApptoUserEmulation;
