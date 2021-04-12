import { mnemonicGenerate } from "@polkadot/util-crypto";
import { ExtrinsicStatus } from "@polkadot/types/interfaces";
import { EventRecord } from "@polkadot/types/interfaces";
import { KeyringPair } from "@polkadot/keyring/types";
import { KeypairType } from "@polkadot/util-crypto/types";
import { ApiPromise, Keyring } from "@polkadot/api";
import config from "./config.json";
import * as _ from "lodash";
import { WsProvider } from "@polkadot/api";
import { formatBalance, u8aToHex } from "@polkadot/util";
class Emulations {
  private api: ApiPromise;

  constructor(
    private readonly config: any,
    private readonly emulationsFactory: EmulationsFactory
  ) {}

  public async run(): Promise<void> {
    for (let emulationConfig of this.config.emulations.sequence) {
      const emulation = this.emulationsFactory.create(emulationConfig);
      try {
        console.log(`Starting an emulation '${emulationConfig.name}'...`);
        const api = await this.init(this.config.network.url);
        await emulation.run(this.api);

        console.log(`The emulation '${emulationConfig.name}' completed.`);
      } catch (e) {
        console.log(
          `Some error occurred during emulation ${emulationConfig.name} run`
        );
        console.error(e);
      }
    }
  }

  /**
   * Initialize the network
   * @param url {string} Network Provider
   */
  public async init(url: string) {
    console.log(`Connecting to blockchain: ${url}`);
    const wsProvider = new WsProvider(url);
    this.api = await ApiPromise.create({
      provider: wsProvider,
      types: {
        ChainId: "u8",
        ResourceId: "[u8; 32]",
        TokenId: "U256",
      },
    });
    await this.api.isReady;
    const chain = await this.api.rpc.system.chain();
    formatBalance.setDefaults({
      decimals: 15,
      unit: "CERE",
    });
    console.log(`Connected to: ${chain}\n`);
  }
}

interface IEmulation {
  run(api: ApiPromise): Promise<void>;
}

class NativeTokensTransferEmulation implements IEmulation {
  private keyRingType: KeypairType;
  private senderAccount: KeyringPair;

  constructor(private readonly config) {}

  public async run(api: ApiPromise): Promise<void> {
    for (let i = 1; i <= this.config.amount; i++) {
      console.log(`Running ${i} native token transfer...`);
      this.loadAccount(api);
      const {
        data: { free: balance },
      } = await api.query.system.account(this.senderAccount.address);
      console.log(`Balance ${JSON.stringify(formatBalance(balance))}`);
      const account = await this.generateSrAccount();
      const value = _.random(
        this.config.tokens_range[0],
        this.config.tokens_range[1]
      );
      const transferAmount = value * 10 ** 15;
      console.log(transferAmount);
      const transfer = await this.transfer(
        api,
        account.ss58Address,
        transferAmount.toString()
      );
    }
  }

  /**
   * Load the senders account from config file.
   * @param api API Promise
   */
  private async loadAccount(api: ApiPromise) {
    console.log(`Loading your accounts`);
    const keyring = new Keyring({ type: "sr25519" });
    this.senderAccount = keyring.addFromMnemonic(this.config.sender_mnemonic);
  }

  /**
   * Transfer native assets
   * @param api API Promise
   * @param address destination address
   * @param value amount to be transfered
   * @returns hash
   */
  private async transfer(
    api: ApiPromise,
    address: string,
    value: string
  ): Promise<string> {
    console.log(`About to transfer ${value} native assets to ${address}`);
    const { nonce } = await api.query.system.account(
      this.senderAccount.address
    );

    const transfer = api.tx.balances.transfer(address, value);
    return new Promise((res, rej) => {
      transfer
        .signAndSend(this.senderAccount, this.sendStatusCb.bind(this, res, rej))
        .catch((err) => rej(err));
    });
  }

  /**
   * Generate account in SR type.
   * @returns Mnemonic, public Key, account id, SS58Address
   */
  private async generateSrAccount() {
    const keyring = new Keyring({ type: "sr25519" });
    const mnemonic = mnemonicGenerate(12);
    const pair = keyring.addFromUri(mnemonic, {});

    return this.extractKeys(mnemonic, pair);
  }

  private extractKeys(mnemonic: string, pair: KeyringPair) {
    return {
      mnemonic,
      publicKey: u8aToHex(pair.publicKey),
      accountId: u8aToHex(pair.publicKey),
      ss58Address: pair.address,
    };
  }

  /**
   * Check for send status call back function
   * @param res Promise response object
   * @param rej Promise reject object
   */
  private sendStatusCb(
    res,
    rej,
    {
      events = [],
      status,
    }: {
      events?: EventRecord[];
      status: ExtrinsicStatus;
    }
  ) {
    if (status.isInvalid) {
      console.info("Transaction invalid");
      rej("Transaction invalid");
    } else if (status.isReady) {
      console.info("Transaction is ready");
    } else if (status.isBroadcast) {
      console.info("Transaction has been broadcasted");
    } else if (status.isInBlock) {
      const hash = status.asInBlock.toHex();
      console.info(`Transaction is in block: ${hash}`);
    } else if (status.isFinalized) {
      const hash = status.asFinalized.toHex();
      console.info(`Transaction has been included in blockHash ${hash}`);
      events.forEach(({ event }) => {
        if (event.method === "ExtrinsicSuccess") {
          console.info("Transaction succeeded");
        } else if (event.method === "ExtrinsicFailed") {
          console.info("Transaction failed");
          throw new Error("Transaction failed");
        }
      });

      res(hash);
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
  const emulations = new Emulations(config, new EmulationsFactory());
  await emulations.run();
}

main()
  .catch(console.error)
  .finally(() => process.exit());
