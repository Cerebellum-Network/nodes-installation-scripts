#!/usr/bin/env bash

protocol=${1:-validator}
echo ${protocol}
node_name=$([ $protocol == boot ] && echo "boot_node" || [ $protocol == validator ] && echo "add_validation_node_custom")

cd /root/cere-network/scripts

docker_image_id=$(docker ps -aqf "name=${node_name}")
echo "Node docker id is ${docker_image_id}.About to stop the node."

docker stop ${docker_image_id}
echo “Creating a backup”
sleep 1
cp -r ../chain-data/chains/cere_ext_devs/db ../chain-db-backup

sleep 1
echo “Compressing the backup”
tar -cvf ../chain-db-backup.tar ../chain-db-backup &
wait $!
lz4 ../chain-db-backup.tar &
wait $!
rm ../chain-db-backup.tar | rm -rf ../chain-db-backup

echo “Starting the node”
docker start ${docker_image_id}
