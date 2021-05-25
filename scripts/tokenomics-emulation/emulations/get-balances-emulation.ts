import {IEmulation} from "./emulation.interface";
import Accounts from "../accounts";
import Network from "../network";

class GetBalancesEmulation implements IEmulation {
    constructor(
        private readonly account: Accounts,
        private readonly network: Network,
        private readonly decimals: number,
    ) {
    }

    public async run(): Promise<void> {
        await this.getBalance('validator-1-stash-sr', 'Validator-1-stash');
        await this.getBalance('validator-2-stash-sr', 'Validator-2-stash');
        await this.getBalance('democracy-1', 'Council-1');
        await this.getBalance('democracy-2', 'Council-2');
        await this.getBalance('sudo', 'Sudo');
        await this.getBalance('manual-bridge', 'Manual bridge');
    }

    private async getBalance(filename: string, walletName: string): Promise<void> {
        const wallet = this.account.loadAccountFromFile(filename);
        return this.getBalanceByAddress(wallet.address, walletName);
    }

    private async getBalanceByAddress(address: string, walletName: string): Promise<void> {
        const balance = await this.network.getBalance(address);
        console.log(`${walletName} balance is ${balance}`);
    }
}

export default GetBalancesEmulation;
