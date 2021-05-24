import { mnemonicGenerate } from '@polkadot/util-crypto';
import { Keyring } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";
import { u8aToHex } from '@polkadot/util';
import fs from "fs";

class Accounts {
  public readonly accounts = [];
  public rootAccount: KeyringPair;

  constructor(private readonly config) {
    console.log(`About to loading accounts\n`);
    const accountsConfig = this.config.accounts;
    accountsConfig.forEach((element) => {
      const account: KeyringPair = this.loadAccountFromFile(element.name);
      if (element.name === 'root') {
        this.rootAccount = account;
      } else {
        this.accounts.push({
          name: element.name,
          account: account,
        });
      }
    });
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

  /**
   * Load Account
   * @param mnemonic string
   * @returns account keyringpair
   */
  public loadAccountFromMnemonic(mnemonic: string) {
    const keyring = new Keyring({ type: "sr25519" });
    const account: KeyringPair = keyring.addFromMnemonic(mnemonic);
    return account;
  }

  public loadAccountFromFile(name: string) {
    const content = fs.readFileSync(
        `./accounts/all/${name}`,
        "utf-8"
    );
    let mnemonicRegex = /(?<="mnemonic":")(.*)(?=","p)/;
    const mnemonic = content.match(mnemonicRegex);
    return this.loadAccountFromMnemonic(mnemonic[0]);
  }

  private extractKeys(mnemonic: string, pair: KeyringPair) {
    return {
      mnemonic,
      publicKey: u8aToHex(pair.publicKey),
      accountId: u8aToHex(pair.publicKey),
      ss58Address: pair.address,
    };
  }
}

export default Accounts;
