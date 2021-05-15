#!/usr/bin/env bash

for i in 1 2 3 4 5 6 7
do
  echo "Stopping ${i}"
  ssh "testnet-node-${i}-dev1" 'sudo su -c "cd ../../root/cere-network; docker-compose down;"'
  ssh "testnet-node-${i}-dev1" 'sudo su -c "cd ../../root; rm -rf cere-network;"'
done
