#!/usr/bin/env bash

#### DEV1 ####
ips=(164.90.155.170\
     104.236.193.202\
     167.99.188.91\
     167.99.131.218\
     165.227.224.150\
     138.197.202.96\
     134.209.192.121)
hosts=(testnet-node-1.dev1.cere.network\
		   testnet-node-2.dev1.cere.network\
       testnet-node-3.dev1.cere.network\
       testnet-node-4.dev1.cere.network\
       testnet-node-5.dev1.cere.network\
       testnet-node-6.dev1.cere.network\
       testnet-node-7.dev1.cere.network)
user="andrei"
path="../../root/"

#### DEV2 ####
#ips=(157.230.113.121\
#     139.59.164.220\
#     165.227.57.154\
#     104.236.108.211)
#hosts=(tokenomic-node-1.dev.cere.network\
#		    tokenomic-node-2.dev.cere.network\
#       tokenomic-node-3.dev.cere.network\
#       tokenomic-node-4.dev.cere.network)
#user="andrei"
#path="../../root/"

repo=https://github.com/Cerebellum-Network/nodes-installation-scripts.git
repoBranch="feature/launch"
dirName="cere-network"

generate_chain_spec () {
  docker-compose down -t 0
  rm -rf chain-data accounts spec-data scripts/keys

  docker-compose up create_chain_spec
  docker-compose up --build generate_accounts
  docker-compose up --build generate_emulations_chain_spec
  docker-compose up create_raw_chain_spec
}

start_boot () {
  ssh ${user}@${ips[0]} 'bash -s'  << EOT
    sudo su -c "cd ${path}; git clone ${repo} ${dirName}; cd ${dirName}; git checkout ${repoBranch}; chmod -R 777 chain-data"
    sudo su -c "cd ${path}${dirName}; sed -i \"s|NODE_NAME=NODE_NAME|NODE_NAME=CereMainnetAlpha01|\" ./configs/.env.mainnet";
    sudo su -c "cd ${path}${dirName}; docker-compose --env-file ./configs/.env.mainnet up -d boot_node"
    sudo su -c "cd ${path}${dirName}; sed -i \"s|testnet-node-1.cere.network:9945.*|${hosts[0]}:9945 {|\" Caddyfile";
    sudo su -c "cd ${path}${dirName}; sed -i \"s|testnet-node-1.cere.network:9934.*|${hosts[0]}:9934 {|\" Caddyfile";
    sudo su -c "cd ${path}${dirName}; docker-compose up -d caddy";
EOT
}

start_genesis_validators () {
  bootNodeID=$(curl -H 'Content-Type: application/json' --data '{ "jsonrpc":"2.0", "method":"system_localPeerId", "id":1 }' ${ips[0]}:9933 -s | jq '.result')
  while [ -z $bootNodeID ]; do
      echo "*** bootNodeID is empty "
      bootNodeID=$(curl -H 'Content-Type: application/json' --data '{ "jsonrpc":"2.0", "method":"system_localPeerId", "id":1 }' ${ips[0]}:9933 -s | jq '.result')
      sleep 5
  done
  ssh ${user}@${ips[1]} 'bash -s'  << EOT
    sudo su -c "cd ${path}; git clone ${repo} ${dirName}; cd ${dirName}; git checkout ${repoBranch}; chmod -R 777 chain-data"
    sudo su -c "cd ${path}${dirName}; sed -i \"s|BOOT_NODE_IP_ADDRESS=.*|BOOT_NODE_IP_ADDRESS=${ips[0]}|\" ./configs/.env.mainnet";
    sudo su -c "cd ${path}${dirName}; sed -i \"s|NETWORK_IDENTIFIER=.*|NETWORK_IDENTIFIER=${bootNodeID}|\" ./configs/.env.mainnet";
    sudo su -c "cd ${path}${dirName}; sed -i \"s|NODE_NAME=NODE_NAME|NODE_NAME=CereMainnetAlpha02|\" ./configs/.env.mainnet";
    sudo su -c "cd ${path}${dirName}; docker-compose --env-file ./configs/.env.mainnet up -d add_validation_node_custom"
    sudo su -c "cd ${path}${dirName}; sed -i \"s|testnet-node-1.cere.network:9945.*|${hosts[1]}:9945 {|\" Caddyfile";
    sudo su -c "cd ${path}${dirName}; sed -i \"s|boot_node:9944|add_validation_node_custom:9944|\" Caddyfile";
    sudo su -c "cd ${path}${dirName}; sed -i \"s|testnet-node-1.cere.network:9934.*|${hosts[1]}:9934 {|\" Caddyfile";
    sudo su -c "cd ${path}${dirName}; sed -i \"s|boot_node:9933|add_validation_node_custom:9933|\" Caddyfile";
    sudo su -c "cd ${path}${dirName}; docker-compose up -d caddy";
EOT
}

insert_keys () {
  NODE_0_URL=http://${hosts[0]}:9933
  NODE_1_URL=http://${hosts[1]}:9933

  curl ${NODE_0_URL} -H "Content-Type:application/json;charset=utf-8" -d "@scripts/keys/node_0_stash_gran.json"
  curl ${NODE_0_URL} -H "Content-Type:application/json;charset=utf-8" -d "@scripts/keys/node_0_gran.json"
  curl ${NODE_0_URL} -H "Content-Type:application/json;charset=utf-8" -d "@scripts/keys/node_0_babe.json"
  curl ${NODE_0_URL} -H "Content-Type:application/json;charset=utf-8" -d "@scripts/keys/node_0_imol.json"
  curl ${NODE_0_URL} -H "Content-Type:application/json;charset=utf-8" -d "@scripts/keys/node_0_audi.json"

  curl ${NODE_1_URL} -H "Content-Type:application/json;charset=utf-8" -d "@scripts/keys/node_1_stash_gran.json"
  curl ${NODE_1_URL} -H "Content-Type:application/json;charset=utf-8" -d "@scripts/keys/node_1_gran.json"
  curl ${NODE_1_URL} -H "Content-Type:application/json;charset=utf-8" -d "@scripts/keys/node_1_babe.json"
  curl ${NODE_1_URL} -H "Content-Type:application/json;charset=utf-8" -d "@scripts/keys/node_1_imol.json"
  curl ${NODE_1_URL} -H "Content-Type:application/json;charset=utf-8" -d "@scripts/keys/node_1_audi.json"
}

restart_genesis () {
  ssh ${user}@${ips[0]} 'bash -s'  << EOT
    sudo su -c "cd ${path}${dirName}; docker-compose restart boot_node"
EOT
  ssh ${user}@${ips[1]} 'bash -s'  << EOT
    sudo su -c "cd ${path}${dirName}; docker-compose restart add_validation_node_custom"
EOT
}

stop_network () {
  for i in ${ips[@]}
  do
    echo "Stopping ${i}"
    ssh ${user}@${i} 'bash -s'  << EOT
    sudo su -c "cd ../../root/cere-network; docker-compose down;"
    sudo su -c "cd ../../root; rm -rf cere-network;"
EOT
  done
}

case $1 in
  generate_chain_spec) "$@"; exit;;
  start_boot) "$@"; exit;;
  start_genesis_validators) "$@"; exit;;
  insert_keys) "$@"; exit;;
  insert_keys) "$@"; exit;;
  restart_genesis) "$@"; exit;;
esac
