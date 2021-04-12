import { IEmulation } from "./emulations/emulation.interface";
import config from "./config.json";
import NativeTokensTransferEmulation from "./emulations/transfer-native-token";
import Network from "./network";
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
  constructor(private readonly network: Network) {}

  public create(config: { name: string }): IEmulation {
    switch (config.name) {
      case "native-tokens-transfer":
        return new NativeTokensTransferEmulation(config, this.network);
      default:
        throw new Error(`Unknown emulation '${config.name}'`);
    }
  }
}

async function main() {
  const network = new Network(config);
  await network.setupNetwork();
  const emulations = new Emulations(config, new EmulationsFactory(network));
  await emulations.run();
}

main()
  .catch(console.error)
  .finally(() => process.exit());
