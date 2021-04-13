import { mnemonicGenerate } from '@polkadot/util-crypto';
import { Keyring } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";
import { u8aToHex } from '@polkadot/util';

class Accounts {
  public readonly accounts = [];
  public rootAccount: KeyringPair;
  public sudoAccount: KeyringPair;

  constructor(private readonly config) {
    console.log(`About to loading accounts\n`);
    const accountsConfig = this.config.accounts;
    const keyring = new Keyring({ type: "sr25519" });
    accountsConfig.forEach((element) => {
      const account: KeyringPair = keyring.addFromMnemonic(element.mnemonic);
      if (element.name === 'root') {
        this.rootAccount = account;
      } else if (element.name === 'sudo') {
        this.sudoAccount = account;
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
