#!/usr/bin/env bash

### validator

sed -i "s|^PROVIDER=.*|PROVIDER=ws://add_validation_node_custom:9944|g" scripts/add-validator/.env
sed -i "s|^STASH_ACCOUNT_MNEMONIC=.*|STASH_ACCOUNT_MNEMONIC=STASH_ACCOUNT_MNEMONIC|g" scripts/add-validator/.env
sed -i "s|^CONTROLLER_ACCOUNT_MNEMONIC=.*|CONTROLLER_ACCOUNT_MNEMONIC=CONTROLLER_ACCOUNT_MNEMONIC|g" scripts/add-validator/.env