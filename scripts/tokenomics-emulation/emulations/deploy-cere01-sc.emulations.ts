import { IEmulation } from "./emulation.interface";
import Accounts from "../accounts";
import CereSmartContract from "../cere-smart-contract";

class DeployCereScEmulation implements IEmulation {
  constructor(
    private readonly config,
    private readonly account: Accounts,
    private readonly cereContract: CereSmartContract,
  ) {}

  public async run(): Promise<void> {
    console.log(`Running emulation for deploy smart contract`);
    const sender = this.account.rootAccount;
    const endowment = this.config.endowment;
    const gasLimit = this.config.gas_limit;
    const initialValue = this.config.initial_value;
    const dsAccounts = this.config.ds_accounts;
    const emulationName = this.config.name;
    const deployCodeHash = await this.cereContract.deploy(sender,emulationName);
    const codeHash = this.config.code_hash;
    const deploy = await this.cereContract.deployBluePrint(sender,codeHash, endowment, gasLimit, initialValue, dsAccounts);
  }
}

export default DeployCereScEmulation;
