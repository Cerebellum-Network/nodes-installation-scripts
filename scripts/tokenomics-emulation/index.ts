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
  public async run(): Promise<void> {
    console.log('ntt');
  }
}

class EmulationsFactory {
  public create(config: { name: string }): IEmulation {
    switch (config.name) {
      case "native-tokens-transfer":
        return new NativeTokensTransferEmulation();
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
