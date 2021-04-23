import { IEmulation } from "./emulation.interface";
import Network from "../network";
import Accounts from "../accounts";
import Batcher from "./batcher";

class SendDdcTxnEmulation implements IEmulation {
  constructor(
    private readonly config,
    private readonly network: Network,
    private readonly account: Accounts,
    private readonly batcher: Batcher
  ) {}

  public async run(): Promise<void> {
    console.log(`Running emulation for send ddc transaction`);
    const sender = this.account.rootAccount;
    const total = +this.config.amount;
   
    await this.batcher.batchProcessing(
      sender,
      this.network,
      total,
      async () => {
        const destination = await this.account.generateSrAccount();
        const sendData = this.generateString(this.config.string_lenght);
        console.log(`Random String is ${sendData}`);
        const sendTxn = await this.network.sendDDC(
          sender,
          destination.ss58Address,
          sendData
        );
      }
    );
  }

  /**
   * Generate string
   * @param length Number of characters
   * @returns string
   */
  private generateString(length: number) {
    let result = [];
    const characters = this.config.characters_to_generate_random_string;
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result.push(
        characters.charAt(Math.floor(Math.random() * charactersLength))
      );
    }
    return result.join("");
  }
}

export default SendDdcTxnEmulation;
