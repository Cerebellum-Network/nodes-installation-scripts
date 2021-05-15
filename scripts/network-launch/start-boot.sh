#!/usr/bin/env bash

ssh testnet-node-1-dev1 'sudo su -c "cd ../../root; git clone https://github.com/Cerebellum-Network/nodes-installation-scripts.git cere-network"'
ssh testnet-node-1-dev1 'sudo su -c "cd ../../root/cere-network; git checkout feature/launch; chmod -R 777 chain-data; docker-compose --env-file ./configs/.env.mainnet up -d boot_node"'
