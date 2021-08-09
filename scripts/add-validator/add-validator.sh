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

sed -i "" "s|PROVIDER=.*|PROVIDER=wss://$domain:9945|" scripts/add-validator/.env
stash_mnemonic=`sed -e 's/^.*"mnemonic":"\([^"]*\)".*$/\1/' scripts/generate-accounts/accounts/all/validator-$id-stash`
echo $stash_mnemonic
sed -i "" "s|STASH_ACCOUNT_MNEMONIC=.*|STASH_ACCOUNT_MNEMONIC=$stash_mnemonic|" scripts/add-validator/.env
controller_mnemonic=`sed -e 's/^.*"mnemonic":"\([^"]*\)".*$/\1/' scripts/generate-accounts/accounts/all/validator-$id-controller`
echo $controller_mnemonic
sed -i "" "s|CONTROLLER_ACCOUNT_MNEMONIC=.*|CONTROLLER_ACCOUNT_MNEMONIC=$controller_mnemonic|" scripts/add-validator/.env
docker-compose build add_validator
docker-compose up add_validator
docker-compose rm add_validator