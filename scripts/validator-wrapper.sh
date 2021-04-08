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
  print_error "Lack params: --domain and --id are required."
  exit 1
fi

# ============ Check arguments ============ 
for arg in "$@"
do
  case $arg in
    --domain=*)
      export domain=`echo $arg | sed -e 's/^[^=]*=//g'`
      ;;
    --id*)
      export id=`echo $arg | sed -e 's/^[^=]*=//g'`
      ;;
    *)
      echo "Unexpected option ${arg}" ;;
  esac
done

echo $domain
echo $id

sed -i '/PROVIDER/d' scripts/validator/.env
sed -i "1s/^/PROVIDER=wss:\/\/${domain}:9945\n/" scripts/validator/.env
controller_mnemonic=`cat scripts/generate-accounts/accounts/all/validator-${id}-controller | grep -Po '(?<="mnemonic":")(.*)(?=","p)'`
stash_mnemonic=`cat scripts/generate-accounts/accounts/all/validator-${id}-stash | grep -Po '(?<="mnemonic":")(.*)(?=","p)'`
echo $controller_mnemonic
echo $stash_mnemonic
sed -i '/STASH_ACCOUNT_MNEMONIC/d' scripts/validator/.env
sed -i "2s|^|STASH_ACCOUNT_MNEMONIC=${stash_mnemonic}\n|" scripts/validator/.env
sed -i '/CONTROLLER_ACCOUNT_MNEMONIC/d' scripts/validator/.env
sed -i "3s|^|CONTROLLER_ACCOUNT_MNEMONIC=${controller_mnemonic}\n|" scripts/validator/.env
docker-compose up add_validator