import * as dotenv from "dotenv";
import * as fs from 'fs';
const util = require('util');
const exec = util.promisify(require('child_process').exec);

dotenv.config();

class Network {
  public async generateAccounts() {
    const srAccount = await this.generateSrAccount();
    console.log(srAccount);
    const edAccount = await this.generateEdAccount(srAccount.mnemonic);
    console.log(edAccount);
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
}

async function main() {
  const network = new Network();
  await network.generateAccounts();
}

main()
  .catch(console.error)
  .finally(() => process.exit());
