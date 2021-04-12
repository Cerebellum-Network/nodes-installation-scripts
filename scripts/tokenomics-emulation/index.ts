import { IEmulation } from "./emulations/emulation.interface";
import config from "./config.json";
import NativeTokensTransferEmulation from "./emulations/transfer-native-token.emulation";
import Network from "./network";
import Accounts from "./accounts";

class Emulations {
  constructor(
    private readonly config: any,
    private readonly emulationsFactory: EmulationsFactory
  ) {}

  public async run(): Promise<void> {
    for (let emulationConfig of this.config.emulations.sequence) {
      const emulation = this.emulationsFactory.create(emulationConfig);
      try {
        console.log(`\nStarting an emulation '${emulationConfig.name}'...`);
        await emulation.run();

        console.log(`The emulation '${emulationConfig.name}' completed.`);
      } catch (e) {
        console.log(
          `\nSome error occurred during emulation ${emulationConfig.name} run`
        );
        console.error(e);
      }
    }
  }
}

class EmulationsFactory {
  constructor(
    private readonly network: Network,
    private readonly account: Accounts
  ) {}

  public create(config: { name: string }): IEmulation {
    switch (config.name) {
      case "native-tokens-transfer":
        return new NativeTokensTransferEmulation(
          config,
          this.network,
          this.account
        );
      default:
        throw new Error(`Unknown emulation '${config.name}'`);
    }
  }
}

async function main() {
  const network = new Network(config);
  await network.setup();
  const account = new Accounts(config);
  const emulations = new Emulations(
    config,
    new EmulationsFactory(network, account)
  );
  await emulations.run();
}

main()
  .catch(console.error)
  .finally(() => process.exit());
