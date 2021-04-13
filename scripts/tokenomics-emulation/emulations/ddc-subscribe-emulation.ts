import { IEmulation } from "./emulation.interface";
import Accounts from "../accounts";
import DdcSmartContract from "../ddc-smart-contract";

class DdcSubscribeEmulation implements IEmulation {
  constructor(
    private readonly config,
    private readonly account: Accounts,
    private readonly ddcContract: DdcSmartContract
  ) {}

  public async run(): Promise<void> {
    for (let i = 1; i <= this.config.amount; i++) {
      console.log(`Running ${i} ddc subscribe...\n`);
      const sender = this.account.sudoAccount;
      const tierId = this.config.tier_id;
      const sendTxn = await this.ddcContract.subscribe(
        sender,
        tierId
      );
    }
  }
}

export default DdcSubscribeEmulation;
