#!/usr/bin/env bash

repo=https://github.com/Cerebellum-Network/nodes-installation-scripts.git
repoBranch="feature/v3-update-testing"
dirName="cere-network"

generate_chain_spec () {
  docker-compose down -t 0
#  rm -rf chain-data spec-data scripts/generate-accounts/accounts scripts/generate-accounts/keys

  docker-compose up create_chain_spec
#  docker-compose up --build generate_accounts
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
#    sudo su -c "cd ${path}${dirName}; docker-compose up -d caddy";
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
#  NODE_0_URL=https://${bootNodeHost}:9934
#  NODE_1_URL=https://${genesisValidatorHost}:9934
  NODE_0_URL=http://${bootNodeIP}:9933
  NODE_1_URL=http://${genesisValidatorIP}:9933

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
#  bootNodeID=$(curl -H 'Content-Type: application/json' --data '{ "jsonrpc":"2.0", "method":"system_localPeerId", "id":1 }' https://${bootNodeHost}:9934 -s | jq '.result')
#  while [ -z $bootNodeID ]; do
#      echo "*** bootNodeID is empty "
#      bootNodeID=$(curl -H 'Content-Type: application/json' --data '{ "jsonrpc":"2.0", "method":"system_localPeerId", "id":1 }' https://${bootNodeHost}:9934 -s | jq '.result')
#      sleep 5
#  done
  bootNodeID=$(curl -H 'Content-Type: application/json' --data '{ "jsonrpc":"2.0", "method":"system_localPeerId", "id":1 }' http://${bootNodeIP}:9933 -s | jq '.result')
  while [ -z $bootNodeID ]; do
      echo "*** bootNodeID is empty "
      bootNodeID=$(curl -H 'Content-Type: application/json' --data '{ "jsonrpc":"2.0", "method":"system_localPeerId", "id":1 }' http://${bootNodeIP}:9933 -s | jq '.result')
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
#    sudo su -c "cd ${path}${dirName}; docker-compose up -d caddy";
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

for arg in "$@"
do
  case $arg in
    --cluster=*)
      path=`echo $arg | sed -e 's/^[^=]*=//g'`
      echo "Loading cluster config from ${path}"
      . $path
      ;;
    *)
      echo "Skipped option ${arg}" ;;
  esac
done

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
