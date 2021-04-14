import { ApiPromise } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";
import Network from "./network";
import { ContractPromise } from "@polkadot/api-contract";
import cere02Abi from "./contract/cere01-metadata.json";

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
   * @returns hash
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

    return new Promise((res, rej) => {
      txnObj
        .signAndSend(sender, Network.sendStatusCb.bind(this, res, rej))
        .catch((err) => rej(err));
    });
  }
}

export default CereSmartContract;
