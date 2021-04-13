import { IEmulation } from "./emulations/emulation.interface";
import config from "./config.json";
import NativeTokensTransferEmulation from "./emulations/transfer-native-token.emulation";
import Network from "./network";
import Accounts from "./accounts";
import ExistentialDepositEmulation from "./emulations/existential-deposit.emulation";
import SendDdcTxnEmulation from "./emulations/ddc-send-txn-emulation";
import DdcReportMetricsEmulation from "./emulations/ddc-report-metrics-emulation";
import DdcSmartContract from "./ddc-smart-contract";

class Emulations {
  constructor(
    private readonly config: any,
    private readonly network: Network,
    private readonly emulationsFactory: EmulationsFactory
  ) {}

  public async run(): Promise<void> {
    for (let emulationConfig of this.config.emulations.sequence) {
      const emulation = this.emulationsFactory.create(emulationConfig);
      try {
        console.log(`Starting an emulation '${emulationConfig.name}'...\n`);
        await emulation.run();
        const treasuryBalance = await this.network.treasuryBalance();
        console.log(`The treasury balance is ${treasuryBalance}`);
        console.log(`The emulation '${emulationConfig.name}' completed.`);
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
    private readonly ddcContract: DdcSmartContract
  ) {}

  public create(config: { name: string }): IEmulation {
    switch (config.name) {
      case "native-tokens-transfer":
        return new NativeTokensTransferEmulation(
          config,
          this.network,
          this.account
        );
      case "existential-deposit-transfer":
        return new ExistentialDepositEmulation(config, this.network, this.account);
      case "send-ddc-transaction":
        return new SendDdcTxnEmulation(config, this.network, this.account);
      case "ddc-metrics-report":
        return new DdcReportMetricsEmulation(config, this.account, this.ddcContract);
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
  const emulations = new Emulations(
    config,
    network,
    new EmulationsFactory(network, account, ddcContract)
  );
  await emulations.run();
}

main()
  .catch(console.error)
  .finally(() => process.exit());