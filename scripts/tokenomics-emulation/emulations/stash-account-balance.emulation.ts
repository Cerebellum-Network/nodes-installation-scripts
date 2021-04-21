import { IEmulation } from "./emulation.interface";
import Network from "../network";
import fs from "fs";

class StashAccountBalanceEmulation implements IEmulation {
  constructor(
    private readonly networkConfig,
    private readonly network: Network
  ) {}

  public async run(): Promise<void> {
    console.log(`Fetch balance of Validators and Nominators Stash account`);
    const genericValidatorsCount = this.networkConfig.validators.amount;
    const nominatorsCount = this.networkConfig.nominators.amount;
    const genesisValidatorsCount = this.networkConfig.genesis_validators_amount;

    console.log(
      `About to fetch balance of Genesis Validators stash account - ${genesisValidatorsCount}\n`
    );
    for (let i = 1; i <= genesisValidatorsCount; i++) {
      await this.processAccount(`validator-${i}-stash-sr`);
    }

    console.log(
      `About to fetch balance of Generic Validators stash account - ${genericValidatorsCount}\n`
    );
    for (let i = 1; i <= genericValidatorsCount; i++) {
      await this.processAccount(`validator-${i}-stash`);
    }

    console.log(
      `About to fetch balance of Nominator stash account - ${nominatorsCount}\n`
    );
    for (let i = 1; i <= nominatorsCount; i++) {
      await this.processAccount(`nominator-${i}-stash`);
    }
  }

  private async processAccount(name: string) {
    const stashAccount = JSON.parse(
      fs.readFileSync(`../generate-accounts/accounts/all/${name}`, "utf-8")
    );
    const balance = await this.network.getRawBalance(stashAccount.ss58Address);
    console.log(`The balance of ${stashAccount.ss58Address} is ${balance}\n`);
  }
}

export default StashAccountBalanceEmulation;
