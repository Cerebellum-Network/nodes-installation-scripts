import { IEmulation } from "./emulation.interface";
import Accounts from "../accounts";
import DdcSmartContract from "../ddc-smart-contract";

class DeployDdcScEmulation implements IEmulation {
  constructor(
    private readonly config,
    private readonly account: Accounts,
    private readonly DdcSmartContract: DdcSmartContract
  ) {}

  public async run(): Promise<void> {
    console.log(`Running emulation for deploying DDC smart contract`);
    const sender = this.account.rootAccount;
    
    const endowment = this.config.endowment;
    const gasLimit = this.config.gas_limit;

    const tier1Limit = this.config.tier_1_fee;
    const tier1ThroughtputLimit = this.config.tier_1_throughput_limit;
    const tier1StorageLimit = this.config.tier1StorageLimit;

    const tier2Limit = this.config.tier_2_fee;
    const tier2ThroughtputLimit = this.config.tier_2_throughput_limit;
    const tier2StorageLimit = this.config.tier2StorageLimit;

    const tier3Limit = this.config.tier_3_fee;
    const tier3ThroughtputLimit = this.config.tier_3_throughput_limit;
    const tier3StorageLimit = this.config.tier3StorageLimit;

    const emulationName = this.config.name;

    const symbol = this.config.symbol;
    const codeHashRes = await this.DdcSmartContract.deploy(sender, emulationName);
    const codeHash = this.config.code_hash;
    const deploy = await this.DdcSmartContract.deployBluePrint(
      sender,
      codeHash,
      endowment,
      gasLimit,
      tier1Limit,
      tier1ThroughtputLimit,
      tier1StorageLimit,
      tier2Limit,
      tier2ThroughtputLimit,
      tier2StorageLimit,
      tier3Limit,
      tier3ThroughtputLimit,
      tier3StorageLimit,
      symbol
    );
  }
}

export default DeployDdcScEmulation;
