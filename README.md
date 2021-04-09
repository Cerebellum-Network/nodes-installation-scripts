# Scripts to simplify Cere Nodes launch
The scripts will help the community to up and run Cere Nodes (Validator, Full). How to use detais can be found in the [Cere Gitbook](https://cere-network.gitbook.io/cere-network/node/install-and-update/start-a-node). 

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
