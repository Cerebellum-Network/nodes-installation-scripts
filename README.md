# Scripts to simplify Cere Nodes launch

The scripts will help the community to up and run Cere Nodes (Validator, Full). How to use details can be found in the [Cere Gitbook](https://cere-network.gitbook.io/cere-network/node/install-and-update/start-a-node).

## Running the validator node

Start validator node by running shell script

```shell
sh ./scripts/launch_validator_node.sh --node-name=TEST_NODE --network=testnet
```

Required parameters are:

- `--node-name` - can by any string.
- `--network` - should be either "test" or "testnet-dev".

It is possible to pass optional parameters:

- `--generate-accounts=1` - any value. If it is set, Stash and Controller accounts will be generated automatically and shared with user as a result. By default it will be taken from parameters.
- `--bond-value` - any number. By default it will be taken from parameters.
- `--reward-commission` - any number in range 0 - 100. By default it will be taken from parameters.

Clean created nodes with

```shell
sh ./scripts/clean_validator_node.sh
```
