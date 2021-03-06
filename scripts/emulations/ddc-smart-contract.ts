import { ApiPromise } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";
import Network from "./network";
import {
  BlueprintPromise,
  CodePromise,
  ContractPromise,
} from "@polkadot/api-contract";
import cere02Abi from "./contracts/cere02-metadata.json";
import fs from "fs";
const cere02Wasm = fs.readFileSync("./contracts/cere02.wasm");
import EventHandlers from "./event-handlers";

class DdcSmartContract {
  private ddcContract: ContractPromise;

  constructor(private readonly config: any, private readonly api: ApiPromise) {
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
   * @returns Transaction
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
    const value = +this.config.network.smart_contract_cere_token_amount_default;
    const txnObj = await this.ddcContract.tx.reportMetrics(
      { value, gasLimit },
      dataRec,
      dataRep,
      reqRec,
      reqRep
    );
    return txnObj;
  }

  /**
   * Subscribe to DDC
   * @param sender Sender
   * @param tierId Tier ID
   * @returns Transaction
   */
  public async subscribe(sender: KeyringPair, tierId: string) {
    console.log(`About to call subscribe in ddc sm from ${sender.address}`);
    const gasLimit = +this.config.network.gas_limit;
    const value = +this.config.network.smart_contract_cere_token_amount_default;
    const txnObj = await this.ddcContract.tx.subscribe(
      { value, gasLimit },
      tierId
    );
    return txnObj;
  }

  /**
   * Deploy the smart contract to fetch code hash
   * @param sender signer
   * @returns Transaction hash
   */
  public async deploy(sender: KeyringPair, emulationName: string) {
    console.log(`Deploying DDC smart contract to get code hash`);
    const code = new CodePromise(this.api, cere02Abi, cere02Wasm);

    const tx = await code.createBlueprint();
    return new Promise((res, rej) => {
      tx.signAndSend(
        sender,
        Network.sendStatusCb.bind(this, res, rej, (events) => {
          EventHandlers.handleEventsForCodeHash(events, emulationName);
        })
      ).catch((err) => rej(err));
    });
  }

  /**
   * Deploy the blluprint on chain
   * @param sender smart contract owner
   * @returns Transaction hash
   */
  public async deployBluePrint(
    sender: KeyringPair,
    codeHash: string,
    endowment: number,
    gasLimit: string,
    tier1Limit: number,
    tier1ThroughtputLimit: number,
    tier1StorageLimit: number,
    tier2Limit: number,
    tier2ThroughtputLimit: number,
    tier2StorageLimit: number,
    tier3Limit: number,
    tier3ThroughtputLimit: number,
    tier3StorageLimit: number,
    symbol: string
  ) {
    console.log("Deploying DDC blue print with code hash");
    const blueprint = new BlueprintPromise(this.api, cere02Abi, codeHash);

    const unsub = await blueprint.tx.new(
      endowment,
      gasLimit,
      tier1Limit,
      tier1ThroughtputLimit,
      tier1StorageLimit,
      tier2Limit,
      tier2ThroughtputLimit,
      tier2StorageLimit,
      tier3Limit,
      tier3ThroughtputLimit,
      tier3StorageLimit,
      symbol
    );
    return new Promise((res, rej) => {
      unsub
        .signAndSend(
          sender,
          Network.sendStatusCb.bind(this, res, rej, (events) => {
            EventHandlers.handleEventsForSmartContractAddress(
              events,
              "ddc_sc_address"
            );
          })
        )
        .catch((err) => rej(err));
    });
  }
}

export default DdcSmartContract;
