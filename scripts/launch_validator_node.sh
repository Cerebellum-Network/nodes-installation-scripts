#!/usr/bin/env bash

### Function list
# ============ Functions to print error message in red ============ 
function print_error {
  # Print the first argument in red
  printf "\e[31m✘ ${1}"

  # Reset colour back to normal
  reset_color=`tput sgr0`
  echo "${reset_color}"
}

# ============ Functions to print ok message, check in green ============ 
function print_ok {
  # Print the first argument in green
  printf "\e[32m✔ ${1}"

  # Reset colour back to normal
  reset_color=`tput sgr0`
  echo "${reset_color}"
}

# ============ Use proper config file based on "network" parameter ============ 
function define_config_file {
  if [[ $1 == "testnet" ]]; then
    export CONFIG_FILE=".env.testnet"
  elif [[ $1 == "testnet-dev" ]]; then
    export CONFIG_FILE=".env.testnet.dev"
  else
    print_error "Incorrect --network parameter, should be \"testnet\" or \"testnet-dev\""
    exit 1
  fi
}

# ============ Reward commission validator ============ 
function validate_and_update_reward_commission {
  if [ "$1" -ge 0 ] && [ "$1" -le 100 ]; then
    echo "REWARD_COMMISSION=$1" >> scripts/validator/.env
  else 
    print_error "Reward commission should be in the range of 0..100"
  fi
}


function update_configs {
  [[ -z "$BOND_VALUE" ]] &&  echo "Use default bond value" || echo "BOND_VALUE=$BOND_VALUE" >> scripts/validator/.env
  [[ -z "$REWARD_COMMISSION" ]] && echo "Use default reward commission" || validate_and_update_reward_commission $REWARD_COMMISSION
}

# ============ Start a Validator Node ============ 
function start_validator_node {
  # 1. Clone this repo.
  git clone git@github.com:Cerebellum-Network/validator-instructions.git
  cd validator-instructions
  # 2. Add permission to the chain-data folder for the container:
  chmod -R 777 ./chain-data
  # 4. Run the script to confirm your environment is ready for Node:
  ./scripts/env-host-check.sh --validator
  # 5. Specify NODE_NAME parameter in the configs/.env.testnet.
  # 6. Run the command to add a custom validator

  update_configs

  docker-compose --env-file ./configs/${CONFIG_FILE} up -d add_validation_node_custom
  docker-compose logs --tail="all" | grep "Local node identity is"
}

# ============ Become a Validator ============ 
function become_a_validator {
  docker-compose --env-file ./scripts/validator/.env up add_validator
}

# ============ Check number of arguments ============ 
if [[ $# -lt 2 ]]; then
  echo "-------------   Number of params:   $#"
  print_error "Lack params: --node-name and --network are required."
  exit 1
fi

# ============ Check arguments ============ 
for arg in "$@"
do
  case $arg in
    --node-name=*)
      export NODE_NAME=`echo $arg | sed -e 's/^[^=]*=//g'`
      ;;
    --network*)
      export NETWORK=`echo $arg | sed -e 's/^[^=]*=//g'`
      ;;
    --generate-accounts=*)
      export GENERATE_ACCOUNTS=`echo $arg | sed -e 's/^[^=]*=//g'`
      ;;
    --bond-value=*)
      export BOND_VALUE=`echo $arg | sed -e 's/^[^=]*=//g'`
      ;;
    --reward-commission=*)
      export REWARD_COMMISSION=`echo $arg | sed -e 's/^[^=]*=//g'`
      ;;
    *)
      echo "Unexpected option ${arg}" ;;
  esac
done

echo Node name = ${NODE_NAME}
echo Network = ${NETWORK}
[[ -z "$GENERATE_ACCOUNTS" ]] && : || echo Generate accounts = ${GENERATE_ACCOUNTS}
[[ -z "$BOND_VALUE" ]] && : || echo Bond value = ${BOND_VALUE}
[[ -z "$REWARD_COMMISSION" ]] && : || echo Reward commission = ${REWARD_COMMISSION}

define_config_file $NETWORK

start_validator_node

echo "NODE_NAME=$NODE_NAME" >> configs/${CONFIG_FILE}

become_a_validator