import { IEmulation } from "./emulation.interface";
import Network from "../network";
import Accounts from "../accounts";
import Validator from "../validator";
import fs from "fs";

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
      const wsProvider = `ws://${this.networkConfig.hosts[i-1].ip}:9944/`;
      const network = new Network(wsProvider, this.networkConfig.decimals);
      await network.setup();

      const validator = new Validator(network, this.account, this.networkConfig.decimals);
      await validator.start(this.networkConfig.sync_wait_time);

      const exsistentialDeposit = await network.existentialDeposit();
      const actualBondValue = stashBond - exsistentialDeposit;
      const stashAccountFile = fs.readFileSync(`../generate-accounts/accounts/all/validator-${i}-stash`);
      const controllerAccountFile = fs.readFileSync(`../generate-accounts/accounts/all/validator-${i}-controller`);
      const stashAccountMnemonic = JSON.parse(stashAccountFile.toString()).mnemonic;
      const controllerAccountMnemonic = JSON.parse(controllerAccountFile.toString()).mnemonic;

      await validator.loadAccounts(stashAccountMnemonic, controllerAccountMnemonic);
      await validator.generateSessionKey();
      await validator.addValidator(actualBondValue);
      await validator.setSessionKey();
      await validator.setCommission(commissionValue);
    }
  }
}

export default AddValidatorsEmulation;
