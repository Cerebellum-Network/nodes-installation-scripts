#!/usr/bin/env bash

#### DEV ####
#bootNodeIP=164.90.173.129
#bootNodeHost=testnet-node-1.dev.cere.network
#genesisValidatorIP=138.68.136.162
#genesisValidatorHost=testnet-node-2.dev.cere.network
#validatorsIPs=(165.227.57.153)
#validatorsHosts=(testnet-node-3.dev.cere.network)
#fullNodeIP=167.71.6.56
#fullNodeHost=rpc.testnet.dev.cere.network
#archiveNodeIP=128.199.37.230
#archiveNodeHost=archive.testnet.dev.cere.network
#user="andrei"
#path="../../root/"

#### DEV1 ####
#bootNodeIP=164.90.155.170
#bootNodeHost=testnet-node-1.dev1.cere.network
#genesisValidatorIP=104.236.193.202
#genesisValidatorHost=testnet-node-2.dev1.cere.network
#validatorsIPs=(167.99.188.91\
#               167.99.131.218\
#               165.227.224.150)
#validatorsHosts=(testnet-node-3.dev1.cere.network\
#                 testnet-node-4.dev1.cere.network\
#                 testnet-node-5.dev1.cere.network)
#fullNodeIP=138.197.202.96
#fullNodeHost=testnet-node-6.dev1.cere.network
#archiveNodeIP=134.209.192.121
#archiveNodeHost=testnet-node-7.dev1.cere.network
#user="andrei"
#path="../../root/"

### QANET ####
#bootNodeIP=161.35.229.40
#bootNodeHost=node-1.qanet.cere.network
#genesisValidatorIP=159.203.161.219
#genesisValidatorHost=node-2.qanet.cere.network
#validatorsIPs=(134.122.45.69\
#               64.225.98.192\
#               138.68.132.196)
#validatorsHosts=(node-3.qanet.cere.network\
#                 node-4.qanet.cere.network\
#                 node-5.qanet.cere.network)
#fullNodeIP=143.198.66.9
#fullNodeHost=rpc.qanet.cere.network
#archiveNodeIP=104.248.91.35
#archiveNodeHost=archive.qanet.cere.network
#user="andrei"
#path="../../root/"

### TESTNET ####
bootNodeIP=165.232.149.206
bootNodeHost=node-1.testnet.cere.network
genesisValidatorIP=45.55.62.114
genesisValidatorHost=node-2.testnet.cere.network
validatorsIPs=(159.203.13.16\
               157.230.106.171)
validatorsHosts=(node-3.testnet.cere.network\
                 node-4.testnet.cere.network)
fullNodeIP=143.198.130.232
fullNodeHost=rpc.testnet.cere.network
archiveNodeIP=178.128.250.106
archiveNodeHost=archive.testnet.cere.network
user="andrei"
path="../../root/"

### EXT DEVS CLUSTER 1 ###
#bootNodeIP=143.198.145.104
#bootNodeHost=ext-devs-node-1.cluster-1.cere.network
#genesisValidatorIP=161.35.140.182
#genesisValidatorHost=ext-devs-node-2.cluster-1.cere.network
#validatorsIPs=(159.203.31.45)
#validatorsHosts=(ext-devs-node-3.cluster-1.cere.network)
#fullNodeIP=""
#fullNodeHost=""
#archiveNodeIP=""
#archiveNodeHost=""
#user="andrei"
#path="../../root/"

### EXT DEVS CLUSTER 2 ###
#bootNodeIP=144.126.223.105
#bootNodeHost=ext-devs-node-1.cluster-2.cere.network
#genesisValidatorIP=164.90.136.15
#genesisValidatorHost=ext-devs-node-2.cluster-2.cere.network
#validatorsIPs=(143.110.214.208)
#validatorsHosts=(ext-devs-node-3.cluster-2.cere.network)
#fullNodeIP=""
#fullNodeHost=""
#archiveNodeIP=""
#archiveNodeHost=""
#user="andrei"
#path="../../root/"

### EXT DEVS CLUSTER 3 ###
#bootNodeIP=144.126.220.75
#bootNodeHost=ext-devs-node-1.cluster-3.cere.network
#genesisValidatorIP=64.225.49.33
#genesisValidatorHost=ext-devs-node-2.cluster-3.cere.network
#validatorsIPs=(142.93.150.99)
#validatorsHosts=(ext-devs-node-3.cluster-3.cere.network)
#fullNodeIP=""
#fullNodeHost=""
#archiveNodeIP=""
#archiveNodeHost=""
#user="root"
#path="../../root/"

### EXT DEVS CLUSTER 4 ###
#bootNodeIP=143.110.234.113
#bootNodeHost=ext-devs-node-1.cluster-4.cere.network
#genesisValidatorIP=159.65.191.43
#genesisValidatorHost=ext-devs-node-2.cluster-4.cere.network
#validatorsIPs=(165.22.225.139)
#validatorsHosts=(ext-devs-node-3.cluster-4.cere.network)
#fullNodeIP=""
#fullNodeHost=""
#archiveNodeIP=""
#archiveNodeHost=""
#user="root"
#path="../../root/"

### EXT DEVS CLUSTER 5 ###
#bootNodeIP=137.184.32.213
#bootNodeHost=ext-devs-node-1.cluster-5.cere.network
#genesisValidatorIP=138.197.97.48
#genesisValidatorHost=ext-devs-node-2.cluster-5.cere.network
#validatorsIPs=(143.198.37.140)
#validatorsHosts=(ext-devs-node-3.cluster-5.cere.network)
#fullNodeIP=""
#fullNodeHost=""
#archiveNodeIP=""
#archiveNodeHost=""
#user="root"
#path="../../root/"

repo=https://github.com/Cerebellum-Network/nodes-installation-scripts.git
repoBranch="feature/relaunch-testnet"
dirName="cere-network"
configFile="./configs/.env.testnet"
nodeNamePrefix="CereTestnet"

generate_chain_spec () {
  docker-compose down -t 0
  rm -rf chain-data spec-data scripts/generate-accounts/accounts scripts/generate-accounts/keys

  docker-compose up create_chain_spec
  docker-compose up --build generate_accounts
  docker-compose up --build generate_emulations_chain_spec
  docker-compose up create_raw_chain_spec
}

start_boot () {
  ssh ${user}@${bootNodeIP} 'bash -s'  << EOT
    sudo su -c "cd ${path}; git clone ${repo} ${dirName}; cd ${dirName}; git checkout ${repoBranch}; chmod -R 777 chain-data"
    sudo su -c "cd ${path}${dirName}; sed -i \"s|NODE_NAME=NODE_NAME|NODE_NAME=${nodeNamePrefix}01|\" ${configFile}";
    sudo su -c "cd ${path}${dirName}; docker-compose --env-file ${configFile} up -d boot_node"
    sudo su -c "cd ${path}${dirName}; sed -i \"s|testnet-node-1.cere.network:9945.*|${bootNodeHost}:9945 {|\" Caddyfile";
    sudo su -c "cd ${path}${dirName}; sed -i \"s|testnet-node-1.cere.network:9934.*|${bootNodeHost}:9934 {|\" Caddyfile";
    sudo su -c "cd ${path}${dirName}; docker-compose up -d caddy";
EOT
}

start_genesis_validators () {
  start_node ${genesisValidatorIP} ${nodeNamePrefix}02 add_validation_node_custom add_validation_node_custom ${genesisValidatorHost}
}

start_validators () {
  for i in ${!validatorsIPs[@]}; do
    let nodeIndex=$i+3
    if (( ${nodeIndex} < 10 )); then
      nodeIndex=0${nodeIndex}
    fi
    echo Starting Validator ${nodeIndex}
    start_node ${validatorsIPs[i]} ${nodeNamePrefix}${nodeIndex} add_validation_node_custom add_validation_node_custom ${validatorsHosts[i]}
  done
}

insert_keys () {
  NODE_0_URL=http://${bootNodeHost}:9933
  NODE_1_URL=http://${genesisValidatorHost}:9933

  curl ${NODE_0_URL} -H "Content-Type:application/json;charset=utf-8" -d "@scripts/generate-accounts/keys/node_0_stash_gran.json"
  curl ${NODE_0_URL} -H "Content-Type:application/json;charset=utf-8" -d "@scripts/generate-accounts/keys/node_0_gran.json"
  curl ${NODE_0_URL} -H "Content-Type:application/json;charset=utf-8" -d "@scripts/generate-accounts/keys/node_0_babe.json"
  curl ${NODE_0_URL} -H "Content-Type:application/json;charset=utf-8" -d "@scripts/generate-accounts/keys/node_0_imol.json"
  curl ${NODE_0_URL} -H "Content-Type:application/json;charset=utf-8" -d "@scripts/generate-accounts/keys/node_0_audi.json"

  curl ${NODE_1_URL} -H "Content-Type:application/json;charset=utf-8" -d "@scripts/generate-accounts/keys/node_1_stash_gran.json"
  curl ${NODE_1_URL} -H "Content-Type:application/json;charset=utf-8" -d "@scripts/generate-accounts/keys/node_1_gran.json"
  curl ${NODE_1_URL} -H "Content-Type:application/json;charset=utf-8" -d "@scripts/generate-accounts/keys/node_1_babe.json"
  curl ${NODE_1_URL} -H "Content-Type:application/json;charset=utf-8" -d "@scripts/generate-accounts/keys/node_1_imol.json"
  curl ${NODE_1_URL} -H "Content-Type:application/json;charset=utf-8" -d "@scripts/generate-accounts/keys/node_1_audi.json"
}

restart_genesis () {
  ssh ${user}@${bootNodeIP} 'bash -s'  << EOT
    sudo su -c "cd ${path}${dirName}; docker-compose restart boot_node"
EOT
  ssh ${user}@${genesisValidatorIP} 'bash -s'  << EOT
    sudo su -c "cd ${path}${dirName}; docker-compose restart add_validation_node_custom"
EOT
}

start_full () {
  start_node ${fullNodeIP} ${nodeNamePrefix}Full01 full_node cere_full_node ${fullNodeHost}
}

start_archive () {
  start_node ${archiveNodeIP} ${nodeNamePrefix}Archive01 archive_node cere_archive_node ${archiveNodeHost}
}

start_node () {
  ip=${1}
  host=${5}
  nodeName=${2}
  serviceName=${3}
  containerName=${4}
  bootNodeID=$(curl -H 'Content-Type: application/json' --data '{ "jsonrpc":"2.0", "method":"system_localPeerId", "id":1 }' ${bootNodeIP}:9933 -s | jq '.result')
  while [ -z $bootNodeID ]; do
      echo "*** bootNodeID is empty "
      bootNodeID=$(curl -H 'Content-Type: application/json' --data '{ "jsonrpc":"2.0", "method":"system_localPeerId", "id":1 }' ${bootNodeIP}:9933 -s | jq '.result')
      sleep 5
  done
  ssh ${user}@${ip} 'bash -s'  << EOT
    sudo su -c "cd ${path}; git clone ${repo} ${dirName}; cd ${dirName}; git checkout ${repoBranch}; chmod -R 777 chain-data"
    sudo su -c "cd ${path}${dirName}; sed -i \"s|BOOT_NODE_IP_ADDRESS=.*|BOOT_NODE_IP_ADDRESS=${bootNodeIP}|\" ${configFile}";
    sudo su -c "cd ${path}${dirName}; sed -i \"s|BOOT_NODE_IP_ADDRESS_2=.*|BOOT_NODE_IP_ADDRESS_2=${bootNodeIP}|\" ${configFile}";
    sudo su -c "cd ${path}${dirName}; sed -i \"s|NETWORK_IDENTIFIER=.*|NETWORK_IDENTIFIER=${bootNodeID}|\" ${configFile}";
    sudo su -c "cd ${path}${dirName}; sed -i \"s|NETWORK_IDENTIFIER_2=.*|NETWORK_IDENTIFIER_2=${bootNodeID}|\" ${configFile}";
    sudo su -c "cd ${path}${dirName}; sed -i \"s|NODE_NAME=NODE_NAME|NODE_NAME=${nodeName}|\" ${configFile}";
    sudo su -c "cd ${path}${dirName}; docker-compose --env-file ${configFile} up -d ${serviceName}"
    sudo su -c "cd ${path}${dirName}; sed -i \"s|testnet-node-1.cere.network:9945.*|${host}:9945 {|\" Caddyfile";
    sudo su -c "cd ${path}${dirName}; sed -i \"s|boot_node:9944|${containerName}:9944|\" Caddyfile";
    sudo su -c "cd ${path}${dirName}; sed -i \"s|testnet-node-1.cere.network:9934.*|${host}:9934 {|\" Caddyfile";
    sudo su -c "cd ${path}${dirName}; sed -i \"s|boot_node:9933|${containerName}:9933|\" Caddyfile";
    sudo su -c "cd ${path}${dirName}; docker-compose up -d caddy";
EOT
}

stop_network () {
  stop_node ${bootNodeIP}
  stop_node ${genesisValidatorIP}
  for i in ${validatorsIPs[@]}
  do
    stop_node ${i}
  done
  stop_node ${fullNodeIP}
  stop_node ${archiveNodeIP}
}

stop_node () {
  ip=${1}
  echo "Stopping ${ip}"
  ssh ${user}@${ip} 'bash -s' << EOT
    sudo su -c "cd ${path}${dirName}; docker-compose down;"
    sudo su -c "cd ${path}; rm -rf cere-network;"
EOT
}

remove_accounts () {
  scripts/generate-accounts/clean.sh
}

case $1 in
  generate_chain_spec) "$@"; exit;;
  start_boot) "$@"; exit;;
  start_genesis_validators) "$@"; exit;;
  start_validators) "$@"; exit;;
  insert_keys) "$@"; exit;;
  restart_genesis) "$@"; exit;;
  start_full) "$@"; exit;;
  start_archive) "$@"; exit;;
  stop_network) "$@"; exit;;
  remove_accounts) "$@"; exit;;
esac
