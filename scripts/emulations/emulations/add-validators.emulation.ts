import { IEmulation } from "./emulation.interface";
import Network from "../network";
import Accounts from "../accounts";
import { Validator } from "../../common/add-validator";

class AddValidatorsEmulation implements IEmulation {
  constructor(
    private readonly account: Accounts,
    private readonly networkConfig: any
  ) {}

  public async run(): Promise<void> {
    const genericValidator = this.networkConfig.validators.amount;
    const commissionValue = this.networkConfig.validators.commission;
    const stashBond = this.networkConfig.validators.stash_stake;
    const genesisValidator = this.networkConfig.genesis_validators_amount;
    for (let i = 1; i <= genericValidator; i++) {
      console.log(`Adding validators to network .. ${i}\n`);
      const wsProvider = this.networkConfig.hosts[genesisValidator + i - 1].url;
      const network = new Network(wsProvider, this.networkConfig.decimals);
      await network.setup();

      const validator = new Validator();
      await validator.start(network, this.networkConfig.sync_wait_time);

      const existentialDeposit = await network.existentialDeposit();
      const actualBondValue = stashBond - existentialDeposit;
      const stashAccount = this.account.loadAccountFromFile(
        `validator-${i}-stash`
      );
      const controllerAccount = this.account.loadAccountFromFile(
        `validator-${i}-controller`
      );

      // Fetch account balance
      const { stashBalance, controllerBalance } =
        await validator.accountBalance(
          network,
          stashAccount.address,
          controllerAccount.address
        );

      console.log(
        `The stash account ${stashAccount.address} balance is ${stashBalance}`
      );
      console.log(
        `The controller account ${controllerAccount.address} balance is ${controllerBalance}`
      );

      // Generate session key
      const sessionKey = await validator.generateSessionKey(network);
      console.log(`The session key is ${sessionKey}`);

      // compare stash balance with bond value
      if (stashBalance <= Number(actualBondValue)) {
        throw new Error(
          "Bond value needs to be lesser than stash account balance."
        );
      }

      // bond token of stash account
      await validator.bondValue(
        network,
        controllerAccount.address,
        stashAccount,
        actualBondValue
      );

      // set session key
      await validator.setSessionKey(network, sessionKey, controllerAccount);

      // set reward commission
      await validator.setCommission(
        network,
        commissionValue,
        controllerAccount
      );
    }
  }
}

export default AddValidatorsEmulation;
