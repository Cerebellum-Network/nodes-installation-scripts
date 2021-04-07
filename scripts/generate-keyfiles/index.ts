import * as fs from "fs";

class Keyfiles {
  private mapping = {
    node_0_stash_gran: "validator-1-stash-sr",
    node_0_gran: "validator-1-controller-ed",
    node_0_babe: "validator-1-controller-sr",
    node_0_imol: "validator-1-controller-sr",
    node_0_audi: "validator-1-controller-sr",
    node_1_stash_gran: "validator-2-stash-ed",
    node_1_gran: "validator-2-controller-ed",
    node_1_babe: "validator-2-controller-sr",
    node_1_imol: "validator-2-controller-sr",
    node_1_audi: "validator-2-controller-sr",
  };
  public async generate() {
    if (!fs.existsSync("../keys")) {
      fs.mkdirSync("../keys");
    }

    for (const [key, value] of Object.entries(this.mapping)) {
      console.log(`Creating file ${key} with ${value} contents`);
      const content = fs.readFileSync(
        `../generate-accounts/accounts/all/${value}`,
        "utf-8"
      );
      let mnemonicRegex = /(?<="mnemonic":")(.*)(?=","p)/;
      const mnemonic = content.match(mnemonicRegex);
      let publicKeyRegex = /(?<="publicKey":")(.*)(?=","a)/;
      const publicKey = content.match(publicKeyRegex);
      this.writeFile(key, key.slice(-4), mnemonic[0], publicKey[0]);
    }
  }

  public async writeFile(filename, firstParam, mnemonic, publicKey) {
    const content = {
      jsonrpc: "2.0",
      id: 1,
      method: "author_insertKey",
      params: [`${firstParam}`, `${mnemonic}`, `${publicKey}`],
    };

    const stringContent = JSON.stringify(content);
    fs.writeFileSync(`../keys/${filename}.json`, stringContent);
  }
}

async function main() {
  const keyFiles = new Keyfiles();
  await keyFiles.generate();
}

main()
  .catch(console.error)
  .finally(() => process.exit());
