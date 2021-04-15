import { IEmulation } from "./emulation.interface";
import Network from "../network";
import Accounts from "../accounts";
import _ from "lodash";

class NativeTokensTransferEmulation implements IEmulation {
  constructor(
    private readonly config,
    private readonly network: Network,
    private readonly account: Accounts
  ) {}

  public async run(): Promise<void> {
    const total = this.config.amount;
    const range = total / this.config.batch_count;
    const sender = this.account.rootAccount;
    let transactionCount = 1;
    for (let batchCount = 1; batchCount <= Math.ceil(range); batchCount++) {
      let transaction = [];

      for (let i = 1; i <= range; i++) {
        if (transactionCount <= total) {
          const destination = await this.account.generateSrAccount();
          const transferAmount = _.random(
            this.config.tokens_range[0],
            this.config.tokens_range[1]
          );
          const transfer = await this.network.transfer(
            sender,
            destination.ss58Address,
            transferAmount.toString()
          );
          transaction.push(transfer);
          transactionCount = transactionCount + 1;
        } else {
          break;
        }
      }
      const sendTransaction = await this.network.signAndSendBathTxn(
        transaction,
        sender
      );
    }
  }
}

export default NativeTokensTransferEmulation;
