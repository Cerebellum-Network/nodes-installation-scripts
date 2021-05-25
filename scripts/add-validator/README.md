# Add Validator

This script will help us in adding the validator node to blockchain programmaticaly. 

<br />

## Requirements
[NodeJs (v14.17.0 lts)](https://nodejs.org/en/download/ "NodeJs (v14.17.0 lts)")

<br />

## Configure app
Open `.env` and update the with appropriate values.

|  Environment variable | Default value  | Description   |
| ------------ | ------------ | ------------ |
|  PROVIDER |  ws://add_validation_node_custom:9944 |  Node websocket provider |
|  STASH_ACCOUNT_MNEMONIC |STASH_ACCOUNT_MNEMONIC   |   Mnemonic for stash account|
| CONTROLLER_ACCOUNT_MNEMONIC  |CONTROLLER_ACCOUNT_MNEMONIC   | Mnemonic for controller account  |
| BOND_VALUE  | 10  | Stash account bond value  |
| REWARD_COMMISSION  | 5  | Reward commission  |
| DECIMAL  | 10  | Decimal value  |

<br />

## Running the project

```bash
$ npm run add-validator
```

<br />

## cleaning the data

```bash
$ sh clean.sh
```