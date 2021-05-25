import { IEmulation } from "./emulation.interface";
import Accounts from "../accounts";
import DdcSmartContract from "../ddc-smart-contract";
import Network from "../network";
import Batcher from "./batcher";

class DdcReportMetricsEmulation implements IEmulation {
  constructor(
    private readonly config,
    private readonly account: Accounts,
    private readonly network: Network,
    private readonly ddcContract: DdcSmartContract,
    private readonly batcher: Batcher
  ) {}

  public async run(): Promise<void> {
    console.log(`Running emulation for ddc report metrics`);
    const sender = this.account.rootAccount;
    const total = +this.config.amount;
    await this.batcher.batchProcessing(
      sender,
      this.network,
      total,
      async () => {
        const dataRec = this.config.data_rec;
        const dataReq = this.config.data_rep;
        const reqRec = this.config.req_rec;
        const reqReq = this.config.req_rep;
        const sendTxn = await this.ddcContract.ddcReportMetrics(
          sender,
          dataRec,
          dataReq,
          reqRec,
          reqReq
        );
      }
    );
  }
}

export default DdcReportMetricsEmulation;
