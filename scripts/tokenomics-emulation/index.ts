import { IEmulation } from "./emulations/emulation.interface";
import config from "./config.json";
import NativeTokensTransferEmulation from "./emulations/transfer-native-token.emulation";
import Network from "./network";
import Accounts from "./accounts";
import ExistentialDepositEmulation from "./emulations/existential-deposit.emulation";
import SendDdcTxnEmulation from "./emulations/ddc-send-txn-emulation";
import DdcReportMetricsEmulation from "./emulations/ddc-report-metrics-emulation";
import DdcSmartContract from "./ddc-smart-contract";
import CereSmartContract from "./cere-smart-contract";
import DdcSubscribeEmulation from "./emulations/ddc-subscribe-emulation";
import CereAppToUserEmulation from "./emulations/cere-app-to-user-emulation";
import CereUserToAppEmulation from "./emulations/cere-user-to-app-emulation";

class Emulations {
  constructor(
    private readonly config: any,
    private readonly network: Network,
    private readonly emulationsFactory: EmulationsFactory
  ) {}

  public async run(): Promise<void> {
    for (let emulationConfig of this.config.emulations.sequence) {
      const emulation = this.emulationsFactory.create(emulationConfig, +this.config.batch_count);
      try {
        console.log(`Starting an emulation '${emulationConfig.name}'...\n`);
        await emulation.run();
        console.log(`The emulation '${emulationConfig.name}' completed.\n`);
        const treasuryBalance = await this.network.treasuryBalance();
        console.log(`The treasury balance is ${treasuryBalance}`);
      } catch (e) {
        console.log(
          `Some error occurred during emulation ${emulationConfig.name} run\n`
        );
        console.error(e);
      }
    }
  }
}

class EmulationsFactory {
  constructor(
    private readonly network: Network,
    private readonly account: Accounts,
    private readonly ddcContract: DdcSmartContract,
    private readonly cereContract: CereSmartContract
  ) {}

  public create(config: { name: string }, batchCount: Number): IEmulation {
    switch (config.name) {
      case "native-tokens-transfer":
        return new NativeTokensTransferEmulation(
          config,
          batchCount,
          this.network,
          this.account
        );
      case "existential-deposit-transfer":
        return new ExistentialDepositEmulation(config, this.network, this.account);
      case "send-ddc-transaction":
        return new SendDdcTxnEmulation(config, this.network, this.account);
      case "ddc-metrics-report":
        return new DdcReportMetricsEmulation(config, this.account, this.ddcContract);
      case "ddc-subscribe":
        return new DdcSubscribeEmulation(config, this.account, this.ddcContract);
      case "cere-app-to-user":
        return new CereAppToUserEmulation(config, this.account, this.cereContract);
      case "cere-user-to-app":
        return new CereUserToAppEmulation(config, this.account, this.cereContract);
      default:
        throw new Error(`Unknown emulation '${config.name}'`);
    }
  }
}

async function main() {
  const network = new Network(config);
  await network.setup();
  const account = new Accounts(config);
  const ddcContract = new DdcSmartContract(config, network.api);
  const cereContract = new CereSmartContract(config, network.api);
  const emulations = new Emulations(
    config,
    network,
    new EmulationsFactory(network, account, ddcContract, cereContract)
  );
  await emulations.run();
}

main()
  .catch(console.error)
  .finally(() => process.exit());