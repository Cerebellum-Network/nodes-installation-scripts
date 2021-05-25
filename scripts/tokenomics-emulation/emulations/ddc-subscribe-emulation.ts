import { IEmulation } from "./emulation.interface";
import Accounts from "../accounts";
import DdcSmartContract from "../ddc-smart-contract";
import Batcher from "./batcher";
import Network from "../network";

class DdcSubscribeEmulation implements IEmulation {
  constructor(
    private readonly config,
    private readonly account: Accounts,
    private readonly network: Network,
    private readonly ddcContract: DdcSmartContract,
    private readonly batcher: Batcher
  ) {}

  public async run(): Promise<void> {
    console.log(`Running emulation for ddc subscribe`);
    const sender = this.account.rootAccount;
    const total = +this.config.amount;
    await this.batcher.batchProcessing(
      sender,
      this.network,
      total,
      async () => {
        const tierId = this.config.tier_id;
        const sendTxn = await this.ddcContract.subscribe(sender, tierId);
      }
    );
  }
}

export default DdcSubscribeEmulation;
