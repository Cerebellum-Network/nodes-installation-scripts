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

    console.log(`About to fetch balance of Genesis Validators stash account - ${genesisValidatorsCount}\n`);
    for (let i = 1; i <= genesisValidatorsCount; i++) {
      const validatorStashAccount = JSON.parse(
        fs.readFileSync(
          `../generate-accounts/accounts/all/validator-${i}-stash-sr`,
          "utf-8"
        )
      );
      const balance = await this.network.getRawBalance(
        validatorStashAccount.ss58Address
      );
      console.log(
        `The balance of ${validatorStashAccount.ss58Address} is ${balance}\n`
      );
    }

    console.log(`About to fetch balance of Generic Validators stash account - ${genericValidatorsCount}\n`);
    for (let i = 1; i <= genericValidatorsCount; i++) {
      const validatorStashAccount = JSON.parse(
        fs.readFileSync(
          `../generate-accounts/accounts/all/validator-${i}-stash`,
          "utf-8"
        )
      );
      const balance = await this.network.getRawBalance(
        validatorStashAccount.ss58Address
      );
      console.log(
        `The balance of ${validatorStashAccount.ss58Address} is ${balance}\n`
      );
    }

    console.log(`About to fetch balance of Nominator stash account - ${nominatorsCount}\n`);
    for (let i = 1; i <= nominatorsCount; i++) {
      const nominatorStashAccount = JSON.parse(
        fs.readFileSync(
          `../generate-accounts/accounts/all/nominator-${i}-stash`,
          "utf-8"
        )
      );
      const balance = await this.network.getRawBalance(
        nominatorStashAccount.ss58Address
      );
      console.log(
        `The balance of ${nominatorStashAccount.ss58Address} is ${balance}\n`
      );
    }
  }
}

export default StashAccountBalanceEmulation;
