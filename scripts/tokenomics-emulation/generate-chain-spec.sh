#!/usr/bin/env bash

rm -rf spec-data/customSpec.json
rm -rf spec-data/customSpecRaw.json

docker-compose up create_chain_spec
docker-compose up generate_accounts
docker-compose up generate_emulations_chain_spec
docker-compose up create_raw_chain_spec
