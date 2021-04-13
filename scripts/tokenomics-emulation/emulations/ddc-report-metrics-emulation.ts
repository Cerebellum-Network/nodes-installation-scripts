import { IEmulation } from "./emulation.interface";
import Accounts from "../accounts";
import DdcSmartContract from "../ddc-smart-contract";

class DdcReportMetricsEmulation implements IEmulation {
  constructor(
    private readonly config,
    private readonly account: Accounts,
    private readonly ddcContract: DdcSmartContract
  ) {}

  public async run(): Promise<void> {
    console.log(`Running ddc report metrics...\n`);
    const sender = this.account.sudoAccount;
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
}

export default DdcReportMetricsEmulation;
