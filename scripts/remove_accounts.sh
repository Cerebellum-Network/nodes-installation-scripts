#!/usr/bin/env bash

### remove account data related to generate-accounts and validator

rm -rf scripts/generate-accounts/accounts
rm -rf scripts/keys
sed -i '/PROVIDER/d' scripts/validator/.env
sed -i "1s/^/PROVIDER=ws:\/\/add_validation_node_custom:9944\n/" scripts/validator/.env
sed -i '/STASH_ACCOUNT_MNEMONIC/d' scripts/validator/.env
sed -i "2s|^|STASH_ACCOUNT_MNEMONIC=STASH_ACCOUNT_MNEMONIC\n|" scripts/validator/.env
sed -i '/CONTROLLER_ACCOUNT_MNEMONIC/d' scripts/validator/.env
sed -i "3s|^|CONTROLLER_ACCOUNT_MNEMONIC=CONTROLLER_ACCOUNT_MNEMONIC\n|" scripts/validator/.env