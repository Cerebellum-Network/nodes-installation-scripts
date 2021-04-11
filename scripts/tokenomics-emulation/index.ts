import config from './config.json';

class Emulations {
  constructor(private readonly config: any,
              private readonly emulationsFactory: EmulationsFactory) {
  }

  public async run(): Promise<void> {
    for (let emulationConfig of this.config.sequence) {
      const emulation = this.emulationsFactory.create(emulationConfig);
      try {
        console.log(`Starting an emulation '${emulationConfig.name}'...`);

        await emulation.run();

        console.log(`The emulation '${emulationConfig.name}' completed.`);
      } catch (e) {
        console.log(`Some error occurred during emulation ${emulationConfig.name} run`);
        console.error(e);
      }
    }
  }
}

interface IEmulation {
  run(): Promise<void>;
}

class NativeTokensTransferEmulation implements IEmulation {
  constructor(private readonly config) {
  }

  public async run(): Promise<void> {
    for (let i = 0; i < this.config.amount; i++) {
      console.log(`Running ${i} native token transfer...`);

      // add token transfer logic here
    }
  }
}

class EmulationsFactory {
  public create(config: { name: string }): IEmulation {
    switch (config.name) {
      case "native-tokens-transfer":
        return new NativeTokensTransferEmulation(config);
      default:
        throw new Error(`Unknown emulation '${config.name}'`);
    }
  }
}

async function main() {
  const emulations = new Emulations(config.emulations, new EmulationsFactory());
  await emulations.run();
}

main()
  .catch(console.error)
  .finally(() => process.exit());
