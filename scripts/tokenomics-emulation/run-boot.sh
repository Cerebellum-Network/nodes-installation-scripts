#!/usr/bin/env bash

git clone https://github.com/Cerebellum-Network/nodes-installation-scripts.git cere-network
cd cere-network
git checkout feature/run-test
chmod -R 777 chain-data
docker-compose --env-file ./configs/.env.testnet up -d boot_node
docker-compose logs -f | grep "Local node identity is"
