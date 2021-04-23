import { IEmulation } from "./emulation.interface";
import Network from "../network";
import Accounts from "../accounts";
import Nominator from "../nominators";

class AddNominatorsEmulation implements IEmulation {
  constructor(
    private readonly account: Accounts,
    private readonly networkConfig: any
  ) {}

  public async run(): Promise<void> {
    const wsProvider = this.networkConfig.hosts[0].url;
    const network = new Network(wsProvider, this.networkConfig.decimals);
    await network.setup();
    const nominator = new Nominator(network, this.networkConfig.decimals);
    const validatorsCount = this.networkConfig.validators.amount;
    const validators = await network.fetchValidators(validatorsCount);
    const nominatorsCount = this.networkConfig.nominators.amount;

    for (let i = 0; i < nominatorsCount; i++) {
      const validatorArray = [validators[(i) % validatorsCount]];

      const stashBond = this.networkConfig.nominators.stash_stake;
      const exsistentialDeposit = await network.existentialDeposit();
      const actualBondValue = stashBond - exsistentialDeposit;

      const stashAccount = this.account.loadAccountFromMnemonic(`nominator-${i + 1}-stash`);
      const controllerAccount = await this.account.loadAccountFromMnemonic(`nominator-${i + 1}-controller`);
      const stashBalance = await network.getBalance(stashAccount.address);

      await nominator.addNominator(actualBondValue,controllerAccount, stashAccount, +stashBalance);
      await nominator.setController(controllerAccount, stashAccount);
      await nominator.nominate(validatorArray, stashAccount);
    }
  }
}

export default AddNominatorsEmulation;
