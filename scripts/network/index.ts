import * as fs from 'fs';

const util = require('util');
const exec = util.promisify(require('child_process').exec);

class Network {
  public async generateAccounts() {
    const dir = __dirname + '/keys';
    if (fs.existsSync(dir)) {
      fs.rmdirSync(dir, { recursive: true });
    }
    fs.mkdirSync(dir);

    const rootAccount = await this.generateRootAccount();
    console.log('\n');

    const sudoAccount = await this.generateSudoAccount();
    console.log('\n');

    const validatorGenesisAccounts = await this.generateGenesisValidatorsAccounts(2);
    console.log('\n');

    const validatorAccounts = await this.generateValidatorsAccounts(3);
    console.log('\n');

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

  private async generateGenesisValidatorsAccounts(number: number) {
    const accounts = [];

    for (let i = 1; i <= number; i++) {
      const validatorStashAccounts = await this.generateGenesisValidatorAccounts(i, 'stash');
      const validatorControllerAccounts = await this.generateGenesisValidatorAccounts(i, 'controller');
      accounts.push({stash: validatorStashAccounts, controller: validatorControllerAccounts});
    }

    return accounts;
  }

  private async generateValidatorsAccounts(number: number) {
    const accounts = [];

    for (let i = 1; i <= number; i++) {
      const account = await this.generateValidatorAccounts(i);
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

  private async generateValidatorAccounts(id) {
    console.log(`Generating Validator accounts...`);

    const stashAccount = await this.generateSrAccount();
    const stashFilename = `validator-${id}-stash`;
    this.writeKeyToFile(stashFilename, JSON.stringify(stashAccount));
    console.log(`Validator ${id} stash account has been written to the '${stashFilename}' file`);

    const controllerFilename = `validator-${id}-controller`;
    const controllerAccount = await this.generateSrAccount();
    this.writeKeyToFile(controllerFilename, JSON.stringify(controllerAccount));
    console.log(`Validator ${id} controller account has been written to the '${controllerFilename}' file`);

    return {stashAccount, controllerAccount};
  }

  public generateFileWithPublicKeys(rootAccount: any, sudoAccount: any, validatorGenesisAccounts) {
    const filename = 'public';

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
    const { stdout, stderr } = await exec('docker-compose up generate_sr_key');

    return this.extractKeys(stdout);
  }

  private async generateEdAccount(mnemonic: string) {
    const file = fs.readFileSync('docker-compose.yaml','utf8');
    const index = file.indexOf('generate_ed_key');
    const index1 = file.indexOf(`'`, index);
    const updatedFile = [file.slice(0, index1+1), mnemonic, file.slice(index1+1)].join('');
    fs.writeFileSync('docker-compose.yaml', updatedFile);

    const { stdout, stderr } = await exec('docker-compose up generate_ed_key');

    fs.writeFileSync('docker-compose.yaml', file);

    return this.extractKeys(stdout);
  }

  private extractKeys(stdout: string) {
    const mnemonicFirstQuote = stdout.indexOf(`\``);
    const mnemonicSecondQuote = stdout.indexOf(`\``, mnemonicFirstQuote + 1);
    const mnemonic = stdout.substring(mnemonicFirstQuote + 1, mnemonicSecondQuote);
    const secretSeed = this.getValueFromOutputByKey(stdout, `Secret seed:`, 6, 66);
    const publicKey = this.getValueFromOutputByKey(stdout, `Public key (hex):`, 1, 66);
    const accountId = this.getValueFromOutputByKey(stdout, `Account ID:`, 7, 66);
    const ss58Address = this.getValueFromOutputByKey(stdout, `SS58 Address:`, 5, 48);

    return {mnemonic, secretSeed, publicKey, accountId, ss58Address};
  }

  private getValueFromOutputByKey(output: string, key: string, spaces: number, length: number): string {
    const index = output.indexOf(key) + key.length + spaces;
    const value = output.substring(index, index + length);

    return value;
  }

  private writeKeyToFile(filename: string, content: string) {
    fs.writeFileSync(`keys/${filename}`, content);
  }
}

async function main() {
  const network = new Network();
  await network.generateAccounts();
}

main()
  .catch(console.error)
  .finally(() => process.exit());
