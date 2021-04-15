import * as fs from 'fs';
import { Keyring } from "@polkadot/api";
import { mnemonicGenerate, cryptoWaitReady } from "@polkadot/util-crypto";
import { u8aToHex } from '@polkadot/util';
import { KeyringPair } from '@polkadot/keyring/types';
import * as dotenv from "dotenv";
dotenv.config();
class Accounts {
  public async generate() {
    if (!fs.existsSync('accounts')) {
      fs.mkdirSync('accounts');
    }
    const dir = 'accounts/all';
    if (fs.existsSync(dir)) {
      fs.rmdirSync(dir, { recursive: true });
    }
    fs.mkdirSync(dir);

    await cryptoWaitReady();

    const rootAccount = await this.generateRootAccount();
    console.log('\n');

    const sudoAccount = await this.generateSudoAccount();
    console.log('\n');

    const validatorGenesisAccounts = await this.generateGenesisValidatorsAccounts();
    console.log('\n');

    const validatorAccounts = await this.generateValidatorsAccounts();
    console.log('\n');

    const generateDemocracyAccount = await this.generateDemocracyAccounts();
    console.log(`\n`);

    const generateSocietyAccount = await this.generateSocietyAccounts();
    console.log(`\n`);

    const generateTechCommAccount = await this.generateTechCommAccounts();
    console.log(`\n`);

    const generateNominatorAccount = await this.generateNominatorsAccounts();
    console.log(`\n`);

    this.generateFileWithPublicKeys(rootAccount, sudoAccount, validatorGenesisAccounts);
  }

  private async generateRootAccount() {
    console.log('Generating Root account...');

    const account = await this.generateSrAccount();
    this.writeKeyToFile(`root`, JSON.stringify(account));
    console.log(`Root account has been written to the 'root' file`);

    return account;
  }

  private async generateSudoAccount() {
    console.log('Generating Sudo account...');

    const account = await this.generateSrAccount();
    this.writeKeyToFile(`sudo`, JSON.stringify(account));
    console.log(`Sudo account has been written to the 'sudo' file`);

    return account;
  }

  private async generateGenesisValidatorsAccounts() {
    const accounts = [];

    const number = +process.env.GENESIS_VALIDATOR_AMOUNT;
    for (let i = 1; i <= number; i++) {
      const validatorStashAccounts = await this.generateGenesisValidatorAccounts(i, 'stash');
      const validatorControllerAccounts = await this.generateGenesisValidatorAccounts(i, 'controller');
      accounts.push({stash: validatorStashAccounts, controller: validatorControllerAccounts});
    }

    return accounts;
  }

  private async generateValidatorsAccounts() {
    const accounts = [];
    const number = +process.env.VALIDATOR_AMOUNT;
    console.log(`Generating Validator accounts of ${number}`);
    for (let i = 1; i <= number; i++) {
      const account = await this.generateStashAndControllerAccounts(i, 'validator');
      accounts.push(account);
    }

    return accounts;
  }

  private async generateGenesisValidatorAccounts(id: number, name: string) {
    console.log(`Generating Validator genesis accounts...`);

    const srAccount = await this.generateSrAccount();
    const srFilename = `validator-${id}-${name}-sr`;
    this.writeKeyToFile(srFilename, JSON.stringify(srAccount));
    console.log(`Validator ${id} ${name} sr account has been written to the '${srFilename}' file`);

    const edFilename = `validator-${id}-${name}-ed`;
    const edAccount = await this.generateEdAccount(srAccount.mnemonic);
    this.writeKeyToFile(edFilename, JSON.stringify(edAccount));
    console.log(`Validator ${id} ${name} ed account has been written to the '${edFilename}' file`);

    return {srAccount, edAccount};
  }

  private async generateNominatorsAccounts() {
    const accounts = [];
    const number = +process.env.NOMINATOR_AMOUNT;
    console.log(`Generating Nominator accounts of ${number}`);
    for (let i = 1; i <= number; i++) {
      const account = await this.generateStashAndControllerAccounts(i, 'nominator');
      accounts.push(account);
    }
    return accounts;
  }

  private async generateStashAndControllerAccounts(id: number, name: string) {
    console.log(`Generating stash and Controller accounts...`);

    const stashAccount = await this.generateSrAccount();
    const stashFilename = `${name}-${id}-stash`;
    this.writeKeyToFile(stashFilename, JSON.stringify(stashAccount));
    console.log(`${name} ${id} stash account has been written to the '${stashFilename}' file`);

    const controllerFilename = `${name}-${id}-controller`;
    const controllerAccount = await this.generateSrAccount();
    this.writeKeyToFile(controllerFilename, JSON.stringify(controllerAccount));
    console.log(`${name} ${id} controller account has been written to the '${controllerFilename}' file`);

    return {stashAccount, controllerAccount};
  }

  private async generateDemocracyAccounts() {
    console.log(`Generating Democracy Account...`);

    const number = +process.env.DEMOCRACY_AMOUNT;
    for (let i = 1; i <= number; i++) {
      const srAccount = await this.generateSrAccount();
      const srFilename = `democracy-${i}`;
      this.writeKeyToFile(srFilename, JSON.stringify(srAccount));
      console.log(
        `Democarcy ${i} sr account has been written to the ${srFilename}`
      );
    }
  }

  private async generateSocietyAccounts() {
    console.log(`Generating Society Account...`);

    const number = +process.env.SOCIETY_AMOUNT;
    for (let i = 1; i <= number; i++) {
      const srAccount = await this.generateSrAccount();
      const srFilename = `society-${i}`;
      this.writeKeyToFile(srFilename, JSON.stringify(srAccount));
      console.log(
        `Society ${i} sr account has been written to the ${srFilename}`
      );
    }
  }

  private async generateTechCommAccounts() {
    console.log(`Generating Tech Comm Account...`);

    const number = +process.env.TECH_COMM_AMOUNT;
    for (let i = 1; i <= number; i++) {
      const srAccount = await this.generateSrAccount();
      const srFilename = `tech-comm-${i}`;
      this.writeKeyToFile(srFilename, JSON.stringify(srAccount));
      console.log(
        `Tech Comm ${i} sr account has been written to the ${srFilename}`
      );
    }
  }

  public generateFileWithPublicKeys(rootAccount: any, sudoAccount: any, validatorGenesisAccounts) {
    const filename = 'accounts/public';

    if (fs.existsSync(filename)) {
      fs.writeFileSync(filename, '');
    }

    const rootAccountContent = `Root account public key is '${rootAccount.ss58Address}'\n`;
    fs.appendFileSync(filename, rootAccountContent);

    const sudoAccountContent = `Sudo account public key is '${sudoAccount.ss58Address}'\n`;
    fs.appendFileSync(filename, sudoAccountContent);

    let genesisValidatorsContent = `Genesis validators\n`;
    for (let i = 0; i < validatorGenesisAccounts.length; i++) {
      genesisValidatorsContent += `Validator ${i+1} stash sr account public key is '${validatorGenesisAccounts[i].stash.srAccount.ss58Address}'\n`;
      genesisValidatorsContent += `Validator ${i+1} stash ed account public key is '${validatorGenesisAccounts[i].stash.edAccount.ss58Address}'\n`;
      genesisValidatorsContent += `Validator ${i+1} controller sr account public key is '${validatorGenesisAccounts[i].controller.srAccount.ss58Address}'\n`;
      genesisValidatorsContent += `Validator ${i+1} controller ed account public key is '${validatorGenesisAccounts[i].controller.edAccount.ss58Address}'\n`;
    }
    fs.appendFileSync(filename, genesisValidatorsContent);
  }

  private async generateSrAccount() {
    const keyring = new Keyring({ type: "sr25519"});
    const mnemonic = mnemonicGenerate(12);
    const pair = keyring.addFromUri(mnemonic, {});

    return this.extractKeys(mnemonic, pair);
  }

  private async generateEdAccount(mnemonic: string) {
    const keyring = new Keyring({ type: "ed25519"});
    const pair = keyring.addFromUri(mnemonic, {});

    return this.extractKeys(mnemonic, pair);
  }

  private extractKeys(mnemonic: string, pair: KeyringPair) {

    return {mnemonic, publicKey: u8aToHex(pair.publicKey), accountId: u8aToHex(pair.publicKey), ss58Address: pair.address};
  }

  private getValueFromOutputByKey(output: string, key: string, spaces: number, length: number): string {
    const index = output.indexOf(key) + key.length + spaces;
    const value = output.substring(index, index + length);

    return value;
  }

  private writeKeyToFile(filename: string, content: string) {
    fs.writeFileSync(`accounts/all/${filename}`, content);
  }
}

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
  public async generateKeyfiles() {
    if (!fs.existsSync("/keys")) {
      fs.mkdirSync("/keys");
    }

    for (const [key, value] of Object.entries(this.mapping)) {
      console.log(`Creating file ${key} with ${value} contents`);
      const content = fs.readFileSync(
        `./accounts/all/${value}`,
        "utf-8"
      );
      let mnemonicRegex = /(?<="mnemonic":")(.*)(?=","p)/;
      const mnemonic = content.match(mnemonicRegex);
      let publicKeyRegex = /(?<="publicKey":")(.*)(?=","a)/;
      const publicKey = content.match(publicKeyRegex);
      this.writeFile(key, key.slice(-4), mnemonic[0], publicKey[0]);
    }
  }

  private writeFile(filename, firstParam, mnemonic, publicKey) {
    const content = {
      jsonrpc: "2.0",
      id: 1,
      method: "author_insertKey",
      params: [`${firstParam}`, `${mnemonic}`, `${publicKey}`],
    };

    const stringContent = JSON.stringify(content);
    fs.writeFileSync(`/keys/${filename}.json`, stringContent);
  }
}

async function main() {
  const accounts = new Accounts();
  await accounts.generate();
  const keyFiles = new Keyfiles();
  await keyFiles.generateKeyfiles();
}

main()
  .catch(console.error)
  .finally(() => process.exit());
