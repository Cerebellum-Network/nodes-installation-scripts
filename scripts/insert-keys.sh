#!/usr/bin/env bash

NODE_0_URL=https://1.2.3.4:9934
NODE_1_URL=https://5.6.7.8:9934

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
