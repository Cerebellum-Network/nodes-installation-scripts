#!/usr/bin/env bash

docker_image_id=$(docker ps -aqf "name=boot_node")
echo "Node docker id is ${docker_image_id}. About to stop the node."

docker stop ${docker_image_id}
sleep 1
echo “Removing old chain data“
rm -rf ./chain-data/chains/cere_ext_devs/db
sleep 1
echo “Decompressing the backup”
lz4 -d ./chain-db-backup.tar.lz4 &
wait $!
tar -xvf ./chain-db-backup.tar &
wait $!
echo “Copying chain data from backup“
mv --force ./chain-db-backup ./chain-data/chains/cere_ext_devs/db &
wait $!
sleep 1
echo “Providing relevant permissions to the db folder“
chmod -R 777 ./chain-data/chains/cere_ext_devs/db
rm chain-db-backup.tar chain-db-backup.tar.lz4

echo “Starting the node”
docker start ${docker_image_id}
