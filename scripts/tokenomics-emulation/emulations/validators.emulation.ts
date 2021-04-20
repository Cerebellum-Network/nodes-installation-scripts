import { IEmulation } from "./emulation.interface";
import Network from "../network";
import Accounts from "../accounts";
import Validator from "../validator";
import fs from "fs";

class ValidatorsEmulation implements IEmulation {
  constructor(
    private readonly config,
    private readonly account: Accounts
  ) {}

  public async run(): Promise<void> {
    const genericValidator = this.config.network.validators.amount;
    const commissionValue = this.config.network.nominators.commission;
    const stashBond = this.config.network.nominators.stash_stake;
    for (let i = 1; i <= genericValidator; i++) {
      const wsProvider = `ws://${this.config.network.hosts[i-1].ip}:9944/`;
      const network = new Network(wsProvider, this.config.network.decimals);
      await network.setup();
      const validator = new Validator(this.config, network, this.account);
      console.log(`Adding validators to network .. ${i}\n`);
      await validator.start(this.config.network.sync_wait_time);
      const stashAccountFile = fs.readFileSync(`../generate-accounts/accounts/all/validator-${i}-stash`);
      const controllerAccountFile = fs.readFileSync(`../generate-accounts/accounts/all/validator-${i}-controller`);
      const stashAccountMnemonic = JSON.parse(stashAccountFile.toString()).mnemonic;
      const controllerAccountMnemonic = JSON.parse(controllerAccountFile.toString()).mnemonic;
      await validator.loadAccounts(stashAccountMnemonic, controllerAccountMnemonic);
      await validator.generateSessionKey();
      await validator.addValidator(stashBond);
      await validator.setSessionKey();
      await validator.setCommission(commissionValue);
    }
  }
}

export default ValidatorsEmulation;
