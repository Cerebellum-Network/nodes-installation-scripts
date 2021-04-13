import { KeyringPair } from "@polkadot/keyring/types";
import { ExtrinsicStatus } from "@polkadot/types/interfaces";
import { EventRecord } from "@polkadot/types/interfaces";
import Network from "./network";
import { ContractPromise } from "@polkadot/api-contract";
import cere02Abi from "./contract/cere02-metadata.json";

class DdcSmartContract {
  private ddcContract: ContractPromise;

  constructor(private readonly config: any, private readonly network: Network) {
    const api = this.network.api;
    const cere02SCAddress = this.config.network.ddc_sc_address;
    this.ddcContract = new ContractPromise(api, cere02Abi, cere02SCAddress);
  }

  /**
   * Calls the report_metrics function in cere02 smart contract
   * @param sender Sender
   * @param dataRec Data Rec
   * @param dataRep Data Rep
   * @param reqRec Request Rec
   * @param reqRep Request Rep
   * @returns hash
   */
  public async ddcReportMetrics(
    sender: KeyringPair,
    dataRec: string,
    dataRep: string,
    reqRec: string,
    reqRep: string
  ) {
    console.log(
      `About to call report_metrics in ddc sm from ${sender.address}`
    );
    const gasLimit = +this.config.network.gas_limit;
    const value = +this.config.network.value;
    const txnObj = await this.ddcContract.tx.reportMetrics(
      { value, gasLimit },
      dataRec,
      dataRep,
      reqRec,
      reqRep
    );

    return new Promise((res, rej) => {
      txnObj
        .signAndSend(sender, this.sendStatusCb.bind(this, res, rej))
        .catch((err) => rej(err));
    });
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

export default DdcSmartContract;
