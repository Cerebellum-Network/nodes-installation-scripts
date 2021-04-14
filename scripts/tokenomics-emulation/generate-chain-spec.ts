import config from './config.json';
import * as fs from 'fs';

class ChainSpecGenerator {
    public generate(spec, config) {
        this.generateIds(spec);
        this.generateProperties(spec, config);
        this.generatePalletBalances(spec, config);
        this.generatePalletStaking(spec, config);
        this.generatePalletSession(spec, config);
        this.generatePalletElectionsPhragmen(spec, config);
    }

    private generateIds(spec) {
        spec.name = "Cerebellum Network Testnet Beta";
        spec.id = "cere_testnet_beta";
    }

    private generateProperties(spec, config) {
        if (!spec.properties) {
            // @ts-ignore
            spec.properties = {};
        }
        spec.properties.tokenSymbol = "CERE";
        spec.properties.tokenDecimals = config.network.decimals;
    }

    private generatePalletBalances(spec, config) {
        spec.genesis.runtime.palletBalances.balances = [];
        const rootAccount = this.readAccount("root");
        let aliceBalance = 0;
        if (config.network.alice) {
            aliceBalance = config.network.alice.stake;
            spec.genesis.runtime.palletBalances.balances.push(["5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY", (10 ** spec.properties.tokenDecimals) * aliceBalance]);
        }

        for (let i = 1; i <= config.network.genesis_validators_amount; i++) {
            const genesisStashSrAccount = this.readAccount(`validator-${i}-stash-sr`);
            spec.genesis.runtime.palletBalances.balances.push([genesisStashSrAccount.ss58Address, (10 ** spec.properties.tokenDecimals) * config.network.genesis_validators_stake]);
        }
        const totalGenesisValidatorsStake = config.network.genesis_validators_amount * config.network.genesis_validators_stake;

        const COUNCIL_MULTIPLIER = 2;
        for (let i = 1; i <= config.network.genesis_councils_amount; i++) {
            const councilAccount = this.readAccount(`democracy-${i}`);
            spec.genesis.runtime.palletBalances.balances.push([councilAccount.ss58Address, COUNCIL_MULTIPLIER * (10 ** spec.properties.tokenDecimals) * config.network.genesis_councils_stake]);
        }
        const totalGenesisCouncilsStake = config.network.genesis_councils_amount * config.network.genesis_councils_stake;

        const treasuryStake = 10000;

        const rootAccountBalance = config.network.total_supply - aliceBalance - totalGenesisValidatorsStake - COUNCIL_MULTIPLIER * totalGenesisCouncilsStake - treasuryStake;
        spec.genesis.runtime.palletBalances.balances.push([rootAccount.ss58Address, (10 ** spec.properties.tokenDecimals) * rootAccountBalance]);
    }

    private generatePalletStaking(spec, config) {
        spec.genesis.runtime.palletStaking.invulnerables = [];
        for (let i = 1; i <= config.network.genesis_validators_amount; i++) {
            const genesisStashSrAccount = this.readAccount(`validator-${i}-stash-sr`);
            spec.genesis.runtime.palletStaking.invulnerables.push(genesisStashSrAccount.ss58Address);
        }
        spec.genesis.runtime.palletStaking.stakers = [];
        for (let i = 1; i <= config.network.genesis_validators_amount; i++) {
            const genesisStashSrAccount = this.readAccount(`validator-${i}-stash-sr`);
            const genesisControllerSrAccount = this.readAccount(`validator-${i}-controller-sr`);
            spec.genesis.runtime.palletStaking.stakers.push([genesisStashSrAccount.ss58Address, genesisControllerSrAccount.ss58Address, (10 ** spec.properties.tokenDecimals) * config.network.genesis_validators_stake, "Validator"])
        }
    }

    private generatePalletSession(spec, config) {
        spec.genesis.runtime.palletSession.keys = [];
        for (let i = 1; i <= config.network.genesis_validators_amount; i++) {
            const genesisStashSrAccount = this.readAccount(`validator-${i}-stash-sr`);
            const genesisControllerEdAccount = this.readAccount(`validator-${i}-controller-ed`);
            const genesisControllerSrAccount = this.readAccount(`validator-${i}-controller-sr`);
            spec.genesis.runtime.palletSession.keys.push([genesisStashSrAccount.ss58Address, genesisStashSrAccount.ss58Address, {
                grandpa: genesisControllerEdAccount.ss58Address,
                babe: genesisControllerSrAccount.ss58Address,
                im_online: genesisControllerSrAccount.ss58Address,
                authority_discovery: genesisControllerSrAccount.ss58Address
            }])
        }
    }

    private generatePalletElectionsPhragmen(spec, config) {
        spec.genesis.runtime.palletElectionsPhragmen.members = [];
        for (let i = 1; i <= config.network.genesis_councils_amount; i++) {
            const councilAccount = this.readAccount(`democracy-${i}`);
            spec.genesis.runtime.palletElectionsPhragmen.members.push([councilAccount.ss58Address, (10 ** config.network.decimals) * config.network.genesis_councils_stake]);
        }
    }

    private readAccount(name: string) {
        return JSON.parse(fs.readFileSync(`${__dirname}/accounts/all/${name}`, "utf-8"));
    }
}

async function main() {
    const spec = JSON.parse(fs.readFileSync(`${__dirname}/spec-data/customSpec.json`, "utf-8"));

    const generator = new ChainSpecGenerator();
    generator.generate(spec, config);
    
    fs.writeFileSync(`${__dirname}/spec-data/customSpec.json`, JSON.stringify(spec, null, 2));
}

main()
    .catch(console.error)
    .finally(() => process.exit());
