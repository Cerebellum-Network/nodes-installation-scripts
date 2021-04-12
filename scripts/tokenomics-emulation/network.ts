import { mnemonicGenerate } from "@polkadot/util-crypto";
import { ExtrinsicStatus } from "@polkadot/types/interfaces";
import { EventRecord } from "@polkadot/types/interfaces";
import { KeyringPair } from "@polkadot/keyring/types";
import { ApiPromise, Keyring } from "@polkadot/api";
import { WsProvider } from "@polkadot/api";
import { formatBalance, u8aToHex } from "@polkadot/util";

class Network {
  private api: ApiPromise;

  constructor(private readonly config: any) {}

  public async setup() {
    console.log("\nAbout to initializing network");
    await this.init(this.config.network.url);
  }

  /**
   * Initialize the network
   * @param url {string} Network Provider
   */
  private async init(url: string) {
    console.log(`\nConnecting to blockchain: ${url}`);
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
    console.log(`Connected to: ${chain}\n`);
  }

  /**
   * Transfer native assets
   * @param sender sender keyringpair
   * @param destination destination address
   * @param value amount to be transfered
   * @returns hash
   */
  public async transfer(
    sender: KeyringPair,
    destination: string,
    value: string
  ): Promise<string> {
    const amount = +value * 10 ** this.config.network.decimals;
    console.log(
      `\nAbout to transfer ${amount} native assets to ${destination} from ${sender.address}`
    );
    const { nonce } = await this.api.query.system.account(sender.address);

    const transfer = this.api.tx.balances.transfer(destination, amount);
    return new Promise((res, rej) => {
      transfer
        .signAndSend(
          sender,
          { nonce: nonce },
          this.sendStatusCb.bind(this, res, rej)
        )
        .catch((err) => rej(err));
    });
  }

  /**
   * Fetch native token balance
   * @param address account addess
   * @returns
   */
  public async getBalance(address: string) {
    console.log(`\nAbout to get balance for: ${address}`);
    const {
      data: { free: balance },
    } = await this.api.query.system.account(address);
    //FIXME: Fix the decimals
    // const decimal = await this.api.registry.chainDecimals;
    return formatBalance(balance, { decimals: this.config.network.decimals });
  }

  /**
   * Generate account in SR type.
   * @returns Mnemonic, public Key, account id, SS58Address
   */
  public async generateSrAccount() {
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

export default Network;
