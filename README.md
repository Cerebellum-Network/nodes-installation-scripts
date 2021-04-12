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
| network           | Yes      | `testnet`, `testnet-dev`     | `--network=testnet`        | A network name.                                                                                                                                            |
| generate-accounts | No       | Any value.                   | `--generate-accounts=1`    | If it is set, Stash and Controller accounts will be generated automatically and shared with user as a result. By default it will be taken from parameters. |
| bond-value        | No       | Any number.                  | `--bond-value=999`         | By default it will be taken from parameters.                                                                                                               |
| reward-commission | No       | Any number in range 0 - 100. | `--reward-commission=10`   | By default it will be taken from parameters.                                                                                                               |

Clean created nodes by running the following script:
```shell
sh ./scripts/clean_validator_node.sh
```

# Scripts to launch Network securely

1. Generate accounts by running the following command (you can configure accounts amount in [.env](./scripts/generate-accounts/.env) file):
    ```bash
    docker-compose up -d generate_accounts
    ``` 
1. Use ./accounts/public to update the chainSpec file.
1. Confirm Genesis Nodes are up and running.
1. Update Genesis Nodes IPs in [insert-keys.sh](./scripts/insert-keys.sh).
1. Insert keys by running the following command:
    ```bash
    ./scripts/insert-keys.sh
    ```
1. Register N Validators by running the following command:
    ```bash
    ./scripts/register-validator.sh --domain={validator_node_domain} --id={id_from_accounts_folder}
    ```
1. Store private data!
1. Clean up private data by running the following command:
    ```bash
    ./scripts/remove-accounts.sh
    ```
