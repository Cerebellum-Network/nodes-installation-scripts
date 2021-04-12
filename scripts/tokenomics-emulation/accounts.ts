import { Keyring } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";

class Account {
  public readonly accounts = [];

  constructor(private readonly config) {}

  /**
   * Load the senders account from config file.
   * @param api API Promise
   */
  public async loadAccount() {
    console.log(`\nAbout to loading accounts`);
    const accountsConfig = this.config.accounts;
    const keyring = new Keyring({ type: "sr25519" });
    accountsConfig.forEach((element) => {
      const account: KeyringPair = keyring.addFromMnemonic(element.mnemonic);
      this.accounts.push({
        name: element.name,
        account: account,
      });
    });
  }
}

export default Account;
