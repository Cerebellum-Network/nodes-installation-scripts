import { Keyring } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";

class Accounts {
  public readonly accounts = [];
  public rootAccount: KeyringPair;
  public sudoAccount: KeyringPair;

  constructor(private readonly config) {
    console.log(`\nAbout to loading accounts`);
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
}

export default Accounts;
