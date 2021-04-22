import { KeypairType } from "@polkadot/util-crypto/types";
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

  public async deploy(sender: KeyringPair) {
    console.log(`Deploy smart contract`);
    const code = new CodePromise(this.api, cere02Abi, cere01Wasm);

    const params = [10000000000, ""];
    const tx = await code.createBlueprint();
    return new Promise((res, rej) => {
      tx.signAndSend(
        sender,
        Network.sendStatusCb.bind(this, res, rej)
      ).catch((err) => rej(err));
    });
  }

  public async bluePrint(sender: KeyringPair) {
    const blueprint = new BlueprintPromise(
      this.api,
      cere02Abi,
      "0x343f41b8cf072966ce537da45c0a9ca6a95db97dcd4e076c8a6fab99e7742023"
    );
    // Deploy a contract using the Blueprint
    const endowment = "100000000000";
    const gasLimit = "200000000";
  
    const unsub = await blueprint.tx.new(endowment, gasLimit, 10000000000, [
      sender.address,
    ]);

    return new Promise((res, rej) => {
      unsub
        .signAndSend(sender, Network.sendStatusCb.bind(this, res, rej))
        .catch((err) => rej(err));
    });
  }
}

export default CereSmartContract;
