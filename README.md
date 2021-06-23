# Scripts to simplify Cere Nodes launch

The scripts will help the community to up and run Cere Nodes (Validator, Full). How to use details can be found in the [Cere Gitbook](https://cere-network.gitbook.io/cere-network/node/install-and-update/start-a-node).

## Running the validator node

Start validator node by running the following script:

For MacOS
```shell
sh ./scripts/launch_validator_node.sh --node-name=TEST_NODE --network=testnet
```
For Linux / Ubunutu
```bash
bash ./scripts/launch_validator_node.sh --node-name=TEST_NODE --network=testnet
```

| Parameter name    | Required | Possible options             | Example                    | Description                                                                                                                                                |
|-------------------|----------|------------------------------|----------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
| node-name         | Yes      | Any string.                  | `--node-name=my-test-node` | A node name.                                                                                                                                               |
| network           | Yes      | `testnet`, `qanet`, `mainnet`, `devnet`     | `--network=testnet`        | A network name.                                                                                                                                            |
| generate-accounts | No       | Any value.                   | `--generate-accounts=1`    | If it is set, Stash and Controller accounts will be generated automatically and shared with user as a result. By default it will be taken from parameters. |
| bond-value        | No       | Any number.                  | `--bond-value=999`         | By default it will be taken from parameters.                                                                                                               |
| reward-commission | No       | Any number in range 0 - 100. | `--reward-commission=10`   | By default it will be taken from parameters.                                                                                                               |

## Clean created nodes by running the following script:

```shell
sh ./scripts/clean_validator_node.sh
```

