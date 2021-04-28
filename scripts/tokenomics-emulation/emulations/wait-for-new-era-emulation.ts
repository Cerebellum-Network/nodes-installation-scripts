import { IEmulation } from "./emulation.interface";
import Network from "../network";

class WaitForNewEraEmulation implements IEmulation {
  constructor(private readonly network: Network) {}
  public async run(): Promise<void> {
    console.log(`Waiting for a new ERA`);
    await this.network.waitForNewEra();
  }
}

export default WaitForNewEraEmulation;
