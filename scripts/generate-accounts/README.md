# Add Validator

This script will help us in generating accounts programmaticaly. 

<br />

## Requirements
[NodeJs (v14.17.0 lts)](https://nodejs.org/en/download/ "NodeJs (v14.17.0 lts)")

<br />

## Configure app
Open `.env` and update the with appropriate values.

|  Environment variable | Default value  | Description   |
| ------------ | ------------ | ------------ |
| GENESIS_VALIDATOR_AMOUNT | 2 | No. of genesis validator accounts |
| VALIDATOR_AMOUNT | 8 | No. of validator accounts|
| DEMOCRACY_AMOUNT  | 2 | No. of democracy accounts|
| SOCIETY_AMOUNT | 2 | No. of society accounts |
| TECH_COMM_AMOUNT  | 2  | No. of Tech comm accounts |
| NOMINATOR_AMOUNT  | 0  | No. of nominator accounts |

<br />

## Running the project

```bash
$ npm run generate-accounts
```

<br />

## cleaning the data

```bash
$ sh clean.sh
```