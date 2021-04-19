#!/usr/bin/env bash

ssh testnet-node-1-dev1 'git clone https://github.com/Cerebellum-Network/nodes-installation-scripts.git cere-network'
ssh testnet-node-1-dev1 'cd cere-network && git checkout feature/run-5 && chmod -R 777 chain-data && docker-compose --env-file ./configs/.env.testnet up -d boot_node'
