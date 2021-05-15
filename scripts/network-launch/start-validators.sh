#!/usr/bin/env bash

for i in 2 3 4 5 6 7
do
  ssh "testnet-node-${i}-dev1" 'sudo su -c "cd ../../root; git clone https://github.com/Cerebellum-Network/nodes-installation-scripts.git cere-network"'
  ssh "testnet-node-${i}-dev1" 'sudo su -c "cd ../../root/cere-network; git checkout feature/launch; chmod -R 777 chain-data; docker-compose --env-file ./configs/.env.mainnet up -d add_validation_node_custom"'
done
