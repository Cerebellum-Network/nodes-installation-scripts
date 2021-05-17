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

case $1 in
  start_boot) "$@"; exit;;
esac
