# Launch Network

Scripts to launch a Network.

```bash
$ bash launch.sh --cluster=<CLUSTER-CONFIG-PATH>
```

CLUSTER-CONFIG-PATH --> cluster config file path

Please provide extra arguments to achieve desired behaviour 
- argument 3 is responsible for protocol (http/https); default is https
- argument 4 is responsible for operation mode; default is normal, however one should specify backup, if the node is booted from backup

http config is only relevant for start_boot, start_genesis_validators, start_validators, and insert_keys scripts.

backup config is only relevant to start_boot, start_genesis_validators, and start_validators sripts.

Example (the boot node has been moved to new IP and db replaced; for other cases simply the node's db has been already replaced):
```
$ bash launch.sh start_boot --cluster=<CLUSTER-CONFIG-PATH> --protocol=http --mode=backup
```

# Backup and Restore Network

Install lz4 before using scripts:
```
sudo apt install liblz4-tool
```

The scripts allow to backup / restore node (this is used for all cases)
Also the scripts allow to operate the network (case 3-4), when the db has been replaced for target nodes and the network is about to be restarted with the boot_node, which has a different IP.

To backup/restore the node provide either the "boot" or "validator" argument depending the type of the node (and cluster config for backup):
```
$ bash operate_node.sh backup validator --cluster=<CLUSTER-CONFIG-PATH>
$ bash operate_node.sh restore boot
```
