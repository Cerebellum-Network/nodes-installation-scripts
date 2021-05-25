import { IEmulation } from "./emulation.interface";
import Network from "../network";

class FetchTotalIssuanceEmulation implements IEmulation {
  constructor(
    private readonly network: Network,
  ) {}

  public async run(): Promise<void> {
    console.log(`Fetching total issuance`);
    const totalIssuance = await this.network.totalIssuance();
    console.log(`Total Issuance is ${totalIssuance}`);
  }
}

export default FetchTotalIssuanceEmulation;
