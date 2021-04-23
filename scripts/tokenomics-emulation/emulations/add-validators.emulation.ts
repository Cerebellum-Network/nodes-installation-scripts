import { IEmulation } from "./emulation.interface";
import Network from "../network";
import Accounts from "../accounts";
import Validator from "../validator";

class AddValidatorsEmulation implements IEmulation {
  constructor(
    private readonly account: Accounts,
    private readonly networkConfig: any
  ) {}

  public async run(): Promise<void> {
    const genericValidator = this.networkConfig.validators.amount;
    const commissionValue = this.networkConfig.nominators.commission;
    const stashBond = this.networkConfig.nominators.stash_stake;
    const genesisValidator = this.networkConfig.genesis_validators_amount;
    const totalValidators = genericValidator + genesisValidator;
    for (let i = genesisValidator +1; i <= totalValidators; i++) {
      console.log(`Adding validators to network .. ${i}\n`);
      const wsProvider = this.networkConfig.hosts[i-1].url;
      const network = new Network(wsProvider, this.networkConfig.decimals);
      await network.setup();

      const validator = new Validator(network, this.account, this.networkConfig.decimals);
      await validator.start(this.networkConfig.sync_wait_time);

      const existentialDeposit = await network.existentialDeposit();
      const actualBondValue = stashBond - existentialDeposit;
      const stashAccount = this.account.loadAccountFromFile(`validator-${i}-stash`);
      const controllerAccount = this.account.loadAccountFromFile(`validator-${i}-controller`);

      await validator.loadAccounts(stashAccount, controllerAccount);
      await validator.generateSessionKey();
      await validator.addValidator(actualBondValue);
      await validator.setSessionKey();
      await validator.setCommission(commissionValue);
    }
  }
}

export default AddValidatorsEmulation;
