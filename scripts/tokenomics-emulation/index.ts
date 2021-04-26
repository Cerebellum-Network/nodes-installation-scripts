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
import Batcher from "./emulations/batcher";
import DeployCereScEmulation from "./emulations/deploy-cere01-sc.emulations";
import DeployDdcScEmulation from "./emulations/deploy-cere02-sc.emulation";
import WaitForNewEraEmulation from "./emulations/wait-for-new-era-emulation";
import AddValidatorsEmulation from "./emulations/add-validators.emulation";
import AddNominatorsEmulation from "./emulations/add-nominator.emulation";
import StashAccountBalanceEmulation from "./emulations/stash-account-balance.emulation";
import FetchTotalIssuanceEmulation from "./emulations/fetch-total-issuance.emulation";


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
    private readonly cereContract: CereSmartContract,
    private readonly batcher: Batcher,
    private readonly networkConfig: any
  ) {}

  public create(config: { name: string }): IEmulation {
    switch (config.name) {
      case "native-tokens-transfer":
        return new NativeTokensTransferEmulation(
          config,
          this.network,
          this.account,
          this.batcher
        );
      case "existential-deposit-transfer":
        return new ExistentialDepositEmulation(config, this.network, this.account, this.batcher);
      case "send-ddc-transaction":
        return new SendDdcTxnEmulation(config, this.network, this.account, this.batcher);
      case "ddc-metrics-report":
        return new DdcReportMetricsEmulation(config, this.account, this.network, this.ddcContract, this.batcher);
      case "ddc-subscribe":
        return new DdcSubscribeEmulation(config, this.account, this.network, this.ddcContract, this.batcher);
      case "cere-app-to-user":
        return new CereAppToUserEmulation(config, this.account,this.network, this.cereContract, this.batcher);
      case "cere-user-to-app":
        return new CereUserToAppEmulation(config, this.account, this.network, this.cereContract, this.batcher);
      case "deploy-cere-smart-contract":
        return new DeployCereScEmulation(config, this.account, this.cereContract, this.networkConfig.decimals);
      case "deploy-ddc-smart-contract":
        return new DeployDdcScEmulation(config, this.account, this.ddcContract, this.networkConfig.decimals);
      case "add-validator":
        return new AddValidatorsEmulation(this.account, this.networkConfig );
      case "wait-for-new-era":
        return new WaitForNewEraEmulation(this.network);
      case "add-nominator":
        return new AddNominatorsEmulation(this.account, this.networkConfig);
      case "validator-nominator-stash-balance":
        return new StashAccountBalanceEmulation(this.networkConfig, this.network, this.account);
      case "fetch-total-issuance":
        return new FetchTotalIssuanceEmulation(this.network);
      default:
        throw new Error(`Unknown emulation '${config.name}'`);
    }
  }
}

async function main() {
  const network = new Network(config.network.hosts[0].url, config.network.decimals);
  await network.setup();
  const account = new Accounts(config);
  const ddcContract = new DdcSmartContract(config, network.api);
  const cereContract = new CereSmartContract(config, network.api);
  const batcher = new Batcher(config.emulations.batch_count);
  const emulations = new Emulations(
    config,
    network,
    new EmulationsFactory(network, account, ddcContract, cereContract, batcher, config.network),
  );
  await emulations.run();
}

main()
  .catch(console.error)
  .finally(() => process.exit());
