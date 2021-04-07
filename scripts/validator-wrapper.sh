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

# ============ Check number of arguments ============ 
if [[ $# -lt 2 ]]; then
  echo "-------------   Number of params:   $#"
  print_error "Lack params: --domain and --n are required."
  exit 1
fi

# ============ Check arguments ============ 
for arg in "$@"
do
  case $arg in
    --domain=*)
      export domain=`echo $arg | sed -e 's/^[^=]*=//g'`
      ;;
    --n*)
      export n=`echo $arg | sed -e 's/^[^=]*=//g'`
      ;;
    *)
      echo "Unexpected option ${arg}" ;;
  esac
done

echo $domain
echo $n

sed -i '/PROVIDER/d' ./validator/.env
sed -i "1s/^/PROVIDER=wss:\/\/${domain}\n/" ./validator/.env
controller_mnemonic=`cat generate-accounts/accounts/all/validator-${n}-controller | grep -Po '(?<="mnemonic":")(.*)(?=","p)'`
stash_mnemonic=`cat generate-accounts/accounts/all/validator-${n}-stash | grep -Po '(?<="mnemonic":")(.*)(?=","p)'`
echo $controller_mnemonic
echo $stash_mnemonic
sed -i '/STASH_ACCOUNT_MNEMONIC/d' ./validator/.env
sed -i "2s|^|STASH_ACCOUNT_MNEMONIC=${stash_mnemonic}\n|" ./validator/.env
sed -i '/CONTROLLER_ACCOUNT_MNEMONIC/d' ./validator/.env
sed -i "3s|^|CONTROLLER_ACCOUNT_MNEMONIC=${controller_mnemonic}\n|" ./validator/.env
docker-compose up add_validator