import { KeyringPair } from "@polkadot/keyring/types";
import Network from "../network";

class Batcher {
  public async batchProcessing(
    sender: KeyringPair,
    network: Network,
    total: number,
    batchCount: number,
    method: Function
  ) {
    const range = total / batchCount;
    let transactionCount = 1;
    for (let batch = 1; batch <= Math.ceil(range); batch++) {
      console.log(`Processing batch ${batch}`);
      let transactions = [];
      for (let i = 1; i <= range; i++) {
        console.log(`Processing transaction ${i}`);
        if (transactionCount <= total) {
          const txn = await method();
          transactions.push(txn);
          transactionCount = transactionCount + 1;
        } else {
          break;
        }
      }
      const sendTransaction = await network.signAndSendBathTxn(
        transactions,
        sender
      );
    }
  }
}

export default Batcher;
