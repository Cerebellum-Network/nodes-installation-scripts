#!/usr/bin/env bash

for i in 2 3 4 5 6 7
do
  ssh "testnet-node-${i}-dev1" 'git clone https://github.com/Cerebellum-Network/nodes-installation-scripts.git cere-network'
  ssh "testnet-node-${i}-dev1" 'cd cere-network && git checkout feature/run-5 && chmod -R 777 chain-data && docker-compose --env-file ./configs/.env.testnet up -d add_validation_node_custom'
done
