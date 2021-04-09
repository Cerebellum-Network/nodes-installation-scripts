#!/usr/bin/env bash

### remove account data related to generate-accounts and validator

rm -rf accounts
rm -rf scripts/keys

sed -i "" "s|PROVIDER=.*|PROVIDER=ws://add_validation_node_custom:9944|" scripts/validator/.env
sed -i "" "s|STASH_ACCOUNT_MNEMONIC=.*|STASH_ACCOUNT_MNEMONIC=STASH_ACCOUNT_MNEMONIC|" scripts/validator/.env
sed -i "" "s|CONTROLLER_ACCOUNT_MNEMONIC=.*|CONTROLLER_ACCOUNT_MNEMONIC=CONTROLLER_ACCOUNT_MNEMONIC|" scripts/validator/.env

