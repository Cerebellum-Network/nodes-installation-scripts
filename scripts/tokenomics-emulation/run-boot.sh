#!/usr/bin/env bash

chmod -R 777 chain-data
docker-compose --env-file ./configs/.env.testnet up -d boot_node
docker-compose logs -f | grep "Local node identity is"
