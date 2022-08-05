#!/usr/bin/env bash

action=${1}
type=${2:-validator}
node_name=$([ $type == boot ] && echo "boot_node" || [ $type == validator ] && echo "add_validation_node_custom")

backup() {
  stop_node

  echo “Creating a backup”
  cp -r ../chain-data/chains/${networkID}/db ../chain-db-backup &
  wait $!
  echo “Compressing the backup”
  tar -cvf ../chain-db-backup.tar ../chain-db-backup &
  wait $!
  lz4 ../chain-db-backup.tar &
  wait $!
  rm ../chain-db-backup.tar | rm -rf ../chain-db-backup

  start_node
}

restore() {
  stop_node

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

  start_node
}

stop_node() {
  cd /root/cere-network/scripts

  docker_image_id=$(docker ps -aqf "name=${node_name}")
  echo "Node docker id is ${docker_image_id}.About to stop the node. "

  docker stop ${docker_image_id} &
  wait $!
}

start_node() {
  echo “Starting the node”
  docker start ${docker_image_id}
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

case ${action} in
  backup) "$@"; exit;;
  restore) "$@"; exit;;
esac
