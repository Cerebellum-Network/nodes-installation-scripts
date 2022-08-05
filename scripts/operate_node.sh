#!/usr/bin/env bash

type=${1:-validator}
action=${2}
node_name=$([ $type == boot ] && echo "boot_node" || [ $type == validator ] && echo "add_validation_node_custom")

cd /root/cere-network/scripts

docker_image_id=$(docker ps -aqf "name=${node_name}")
echo "Node docker id is ${docker_image_id}.About to stop the node. "

docker stop ${docker_image_id} &
wait $!

if [ $action == "backup" ]; then
echo “Creating a backup”
cp -r ../chain-data/chains/${networkID}/db ../chain-db-backup &
wait $!
echo “Compressing the backup”
tar -cvf ../chain-db-backup.tar ../chain-db-backup &
wait $!
lz4 ../chain-db-backup.tar &
wait $!
rm ../chain-db-backup.tar | rm -rf ../chain-db-backup

else if [ $action == "restore" ]; then
echo “Removing old chain data“
rm -rf ../chain-data/chains/cere_ext_devs/db &
wait $!
echo “Decompressing the backup”
lz4 -d ../chain-db-backup.tar.lz4 &
wait $!
tar -xvf ../chain-db-backup.tar -C ../ &
wait $!
echo “Copying chain data from backup“
mv --force ../chain-db-backup ../chain-data/chains/cere_ext_devs/db &
wait $!
echo “Providing relevant permissions to the db folder“
chmod -R 777 ../chain-data/chains/cere_ext_devs/db
rm ../chain-db-backup.tar ../chain-db-backup.tar.lz4

fi

echo “Starting the node”
docker start ${docker_image_id}
