# Generate Accounts

This script generates accounts. 


## Requirements
[NodeJs (v12.18.4)](https://nodejs.org/en/download/ "NodeJs (v12.18.4)")


## Configure app
Open `.env` and update it with the appropriate values.

|  Environment variable | Default value  | Description   |
| ------------ | ------------ | ------------ |
| GENESIS_VALIDATOR_AMOUNT | 2 | No. of genesis validator accounts |
| VALIDATOR_AMOUNT | 8 | No. of validator accounts|
| DEMOCRACY_AMOUNT  | 2 | No. of democracy accounts|
| SOCIETY_AMOUNT | 2 | No. of society accounts |
| TECH_COMM_AMOUNT  | 2  | No. of Tech comm accounts |
| NOMINATOR_AMOUNT  | 0  | No. of nominator accounts |


## Running the project
Run from the root:

```bash
$ docker-compose up generate_accounts
```


## cleaning the data

```bash
$ bash clean.sh
```