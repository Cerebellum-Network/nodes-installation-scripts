import config from './config.json';
import * as fs from 'fs';

class ChainSpecGenerator {
    public generate(spec, config) {
        this.generateIds(spec, config);
        this.generateProperties(spec, config);
        this.generatePalletSudo(spec);
        this.generatePalletBalances(spec, config);
        this.generatePalletStaking(spec, config);
        this.generatePalletSession(spec, config);
        this.generatePalletElectionsPhragmen(spec, config);
        this.generatePalletSociety(spec, config);
        this.generatePalletTechComm(spec, config);
    }

    private generateIds(spec, config) {
        spec.name = config.network.name;
        spec.id = config.network.id;
        spec.chainType = config.network.chainType;
    }

    private generateProperties(spec, config) {
        if (!spec.properties) {
            // @ts-ignore
            spec.properties = {};
        }
        spec.properties.tokenSymbol = "CERE";
        spec.properties.tokenDecimals = config.network.decimals;
    }

    private generatePalletSudo(spec) {
        const sudoAccount = this.readAccount(`sudo`);
        spec.genesis.runtime.palletSudo.key = sudoAccount.ss58Address;
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

        for (let i = 1; i <= config.network.validators.amount; i++) {
            const validatorStashAccount = this.readAccount(`validator-${i}-stash`);
            spec.genesis.runtime.palletBalances.balances.push([validatorStashAccount.ss58Address, (10 ** spec.properties.tokenDecimals) * config.network.validators.stash_stake]);
            const validatorControllerAccount = this.readAccount(`validator-${i}-controller`);
            spec.genesis.runtime.palletBalances.balances.push([validatorControllerAccount.ss58Address, (10 ** spec.properties.tokenDecimals) * config.network.validators.controller_stake]) 
        }
        const validatorsStake = config.network.validators.amount * config.network.validators.stash_stake;
        const validatorsController = config.network.validators.amount * config.network.validators.controller_stake;
        const totalValidatorsStake = validatorsStake + validatorsController;

        for (let i = 1; i <= config.network.nominators.amount; i++) {
            const nominatorStashAccount = this.readAccount(`nominator-${i}-stash`);
            spec.genesis.runtime.palletBalances.balances.push([nominatorStashAccount.ss58Address, (10 ** spec.properties.tokenDecimals) * config.network.nominators.stash_stake]);
            const nominatorControllerAccount = this.readAccount(`nominator-${i}-controller`);
            spec.genesis.runtime.palletBalances.balances.push([nominatorControllerAccount.ss58Address, (10 ** spec.properties.tokenDecimals) * config.network.nominators.controller_stake]) 
        }
        const nominatorsStake = config.network.nominators.amount * config.network.nominators.stash_stake;
        const nominatorsController = config.network.nominators.amount * config.network.nominators.controller_stake;
        const totalNominatorsStake = nominatorsStake + nominatorsController;

        for (let i = 1; i <= config.network.genesis_councils_amount; i++) {
            const councilAccount = this.readAccount(`democracy-${i}`);
            spec.genesis.runtime.palletBalances.balances.push([councilAccount.ss58Address, (10 ** spec.properties.tokenDecimals) * config.network.genesis_councils_stake]);
        }
        const totalGenesisCouncilsStake = config.network.genesis_councils_amount * config.network.genesis_councils_stake;

        const treasuryStake = 1;

        let sudoStake = 0;
        if (config.network.sudo) {
            sudoStake = config.network.sudo.stake;
            const sudoAccount = this.readAccount(`sudo`);
            spec.genesis.runtime.palletBalances.balances.push([sudoAccount.ss58Address, (10 ** spec.properties.tokenDecimals * sudoStake)]);
        }

        const rootAccountBalance = config.network.total_supply - aliceBalance - totalGenesisValidatorsStake - totalValidatorsStake - totalNominatorsStake - totalGenesisCouncilsStake - treasuryStake - sudoStake;
        if (config.network.manual_bridge) {
            const manualBridgeAccount = this.readAccount(`manual-bridge`);
            spec.genesis.runtime.palletBalances.balances.push([manualBridgeAccount.ss58Address, (10 ** spec.properties.tokenDecimals) * rootAccountBalance]);
        } else {
            spec.genesis.runtime.palletBalances.balances.push([rootAccount.ss58Address, (10 ** spec.properties.tokenDecimals) * rootAccountBalance]);
        }
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

    private generatePalletSociety(spec, config) {
        spec.genesis.runtime.palletSociety.maxMembers = config.network.pallet_society.max_members;
        spec.genesis.runtime.palletSociety.members = [];
        for (let i = 1; i <= config.network.pallet_society.amount; i++) {
            const societyAccount = this.readAccount(`society-${i}`);
            spec.genesis.runtime.palletSociety.members.push(societyAccount.ss58Address);
        }
    }

    private generatePalletTechComm(spec, config) {
        spec.genesis.runtime.palletCollectiveInstance2.members = [];
        for (let i = 1; i <= config.network.pallet_tech_comm.amount; i++) {
            const techCommAccount = this.readAccount(`tech-comm-${i}`);
            spec.genesis.runtime.palletCollectiveInstance2.members.push(techCommAccount.ss58Address);
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
