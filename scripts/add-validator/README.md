# Add Validator

This script will add a Validator Node to the existing Cere Network programmatically.


## Requirements
[NodeJs (v12.18.4)](https://nodejs.org/en/download/ "NodeJs (v12.18.4)")


## Configuring app
Open `.env` and update it with the appropriate values.

|  Environment variable | Default value  | Description   |
| ------------ | ------------ | ------------ |
|  PROVIDER |  ws://add_validation_node_custom:9944 |  Node websocket provider |
|  STASH_ACCOUNT_MNEMONIC |STASH_ACCOUNT_MNEMONIC   |   Mnemonic for stash account|
| CONTROLLER_ACCOUNT_MNEMONIC  |CONTROLLER_ACCOUNT_MNEMONIC   | Mnemonic for controller account  |
| BOND_VALUE  | 10  | Stash account bond value  |
| REWARD_COMMISSION  | 5  | Reward commission  |
| DECIMAL  | 10  | Decimal value  |


## Running the project
Run from the root:

```bash
$ bash add-validator.sh --domain=<NETWORK-DOMAIN> --id=<VALIDATOR-ID>
```
NETWORK-URL  -->  Validator node domain name, Eg: node-1.cere.network

VALIDATOR-ID -->  Validator Id, for using it as stash and controller account. 


## Cleaning the data

This script will update .env file with default values.
```bash
$ bash clean.sh
```