import { EventRecord } from '@polkadot/types/interfaces';
import { ApiPromise } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";
import Network from "./network";
import {
  BlueprintPromise,
  CodePromise,
  ContractPromise,
} from "@polkadot/api-contract";
import cere02Abi from "./contract/cere01-metadata.json";
import fs from "fs";
const cere01Wasm = fs.readFileSync("./contract/cere01.wasm");
import EventHandlers from './event-handlers';

class CereSmartContract {
  private cereContract: ContractPromise;

  constructor(private readonly config: any, private readonly api: ApiPromise) {
    const cere02SCAddress = this.config.network.cere_sc_address;
    this.cereContract = new ContractPromise(api, cere02Abi, cere02SCAddress);
  }

  /**
   * Send token from smart contract to user address
   * @param sender Sender
   * @param destination Destination account
   * @param amount Token value
   * @param txnFee Transaction fee
   * @returns Transaction
   */
  public async transfer(
    sender: KeyringPair,
    destination: string,
    amount: string,
    txnFee: string
  ) {
    const tokenValue = +amount * 10 ** this.config.network.decimals;
    console.log(
      `About to transfer ${tokenValue} from smart contract to ${destination} by ${sender.address}`
    );
    const gasLimit = +this.config.network.gas_limit;
    const value = +this.config.network.smart_contract_cere_token_amount_default;

    const txnObj = await this.cereContract.tx.transfer(
      { value, gasLimit },
      destination,
      tokenValue,
      txnFee
    );

    return txnObj;
  }

  /**
   * Estimate transaction fee
   * @param sender sender
   * @param destination destination account
   * @param amount amonunt
   * @returns Transaction fee
   */
  public async estimateTxnFee(
    sender: KeyringPair,
    destination: string,
    amount: string
  ) {
    console.log(
      `About to estimate transaction fee for smart contract transfer`
    );
    const gasLimit = +this.config.network.gas_limit;
    const value = +this.config.network.smart_contract_cere_token_amount_default;

    const { partialFee: txnFee } = await this.cereContract.tx
      .transfer({ value, gasLimit }, destination, amount, 0)
      .paymentInfo(sender);
    return txnFee;
  }

  /**
   * Deploy the code to get code_hash
   * @param sender owner of smart contract
   * @returns code_hash
   */
  public async deploy(sender: KeyringPair, emulationName: string) {
    console.log(`Deploy smart contract`);
    const code = new CodePromise(this.api, cere02Abi, cere01Wasm);

    const tx = await code.createBlueprint();
    return new Promise((res, rej) => {
      tx.signAndSend(
        sender,
        Network.sendStatusCb.bind(this, res, rej, EventHandlers.handleEventsForCodeHash, emulationName)
      ).catch((err) => rej(err));
    });
  }

  /**
   * Deploy the blueprint on chain
   * @param sender smart contract owner
   * @returns Transaction hash
   */
  public async deployBluePrint(
    sender: KeyringPair,
    codeHash: string,
    endowment: string,
    gasLimit: string,
    initialValue: number,
    dsAccounts: string[]
  ) {
    const blueprint = new BlueprintPromise(this.api, cere02Abi, codeHash);

    const unsub = await blueprint.tx.new(
      endowment,
      gasLimit,
      initialValue,
      dsAccounts
    );

    return new Promise((res, rej) => {
      unsub
        .signAndSend(
          sender,
          Network.sendStatusCb.bind(this, res, rej, EventHandlers.handleEventsForSmartContractAddress, "cere_sc_address" )
        )
        .catch((err) => rej(err));
    });
  }

}

export default CereSmartContract;
