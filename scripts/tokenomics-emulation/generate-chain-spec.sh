#!/usr/bin/env bash

docker-compose down -t 0
rm -rf chain-data accounts spec-data scripts/keys

docker-compose up create_chain_spec
docker-compose build generate_accounts
docker-compose up generate_accounts
docker-compose build generate_emulations_chain_spec
docker-compose up generate_emulations_chain_spec
docker-compose up create_raw_chain_spec

