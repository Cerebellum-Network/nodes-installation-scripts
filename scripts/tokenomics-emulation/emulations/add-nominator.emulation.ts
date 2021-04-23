import { IEmulation } from "./emulation.interface";
import Network from "../network";
import Accounts from "../accounts";
import fs from "fs";
import Nominator from "../nominators";

class AddNominatorsEmulation implements IEmulation {
  constructor(
    private readonly account: Accounts,
    private readonly networkConfig: any
  ) {}

  public async run(): Promise<void> {
    const wsProvider = this.networkConfig.url;
    const network = new Network(wsProvider, this.networkConfig.decimals);
    await network.setup();
    const nominator = new Nominator(network, this.networkConfig.decimals);
    const validatorsCount = this.networkConfig.validators.amount;
    const validators = await network.fetchValidators(validatorsCount);
    const nominatorsCount = this.networkConfig.nominators.amount;

    for (let i = 0; i < nominatorsCount; i++) {
      const validatorArray = [validators[(i) % validatorsCount]];
      const stashAccountFile = fs.readFileSync(
        `../generate-accounts/accounts/all/nominator-${i + 1}-stash`
      );
      const controllerAccountFile = fs.readFileSync(
        `../generate-accounts/accounts/all/nominator-${i + 1}-controller`
      );
      const stashAccountMnemonic = JSON.parse(stashAccountFile.toString())
        .mnemonic;
      const controllerAccountMnemonic = JSON.parse(
        controllerAccountFile.toString()
      ).mnemonic;

      const stashBond = this.networkConfig.nominators.stash_stake;
      const exsistentialDeposit = await network.existentialDeposit();
      const actualBondValue = stashBond - exsistentialDeposit;

      const stashAccount = await this.account.loadAccount(stashAccountMnemonic);
      const controllerAccount = await this.account.loadAccount(controllerAccountMnemonic);
      const stashBalace = await network.getBalance(stashAccount.address);

      await nominator.addNominator(actualBondValue,controllerAccount, stashAccount, +stashBalace);
      await nominator.setController(controllerAccount, stashAccount);
      await nominator.nominate(validatorArray, stashAccount);

    }
  }
}

export default AddNominatorsEmulation;
