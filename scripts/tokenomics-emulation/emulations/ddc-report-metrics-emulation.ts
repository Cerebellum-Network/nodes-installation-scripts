import { IEmulation } from "./emulation.interface";
import Network from "../network";
import Accounts from "../accounts";

class DdcReportMetricsEmulation implements IEmulation {
  constructor(
    private readonly config,
    private readonly network: Network,
    private readonly account: Accounts
  ) {}

  public async run(): Promise<void> {
    console.log(`Running ddc report metrics...\n`);
    const sender = this.account.sudoAccount;
    const dataRec = this.config.data_rec;
    const dataReq = this.config.data_rep;
    const reqRec = this.config.req_rec;
    const reqReq = this.config.req_rep;
    const sendTxn = await this.network.ddcReportMetrics(
      sender,
      dataRec,
      dataReq,
      reqRec,
      reqReq
    );
  }
}

export default DdcReportMetricsEmulation;
