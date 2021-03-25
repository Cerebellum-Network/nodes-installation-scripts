#!/usr/bin/env bash

### Local machine enviroment check

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

# ============ Functions to check if a port number is openned or not in firewall ============ 
function check_port {
  case "$(uname -s)" in
    # For Mac OS
    Darwin)
      CHECK_RESULT=`lsof -i:${1}`
      if [[ $CHECK_RESULT =~ "Status: inactive" ]]; then
        echo "Check result:   ${1}              $(print_ok)"
        echo "Firewall is disable, so that all ports are opened."
      elif [[ $CHECK_RESULT =~ "${1}" ]]; then
        echo "Check result:   ${1}              $(print_ok)"
      else
        echo "Check result:   ${1}              $(print_error)"
        print_error "Please open port by run: sudo ufw allow ${1}/tcp"
      fi
      ;;
    # For Ubuntu
    Linux)
      CHECK_RESULT=`sudo ufw status`
      if [[ $CHECK_RESULT =~ "Status: inactive" ]]; then
        echo "Check result:   ${1}              $(print_ok)"
        echo "Firewall is disable, so that all ports are opened."
      elif [[ $CHECK_RESULT =~ "${1}/tcp" ]]; then
        echo "Check result:   ${1}              $(print_ok)"
      else
        echo "Check result:   ${1}              $(print_error)"
        print_error "Please open port by run: sudo ufw allow ${1}/tcp"
      fi
      ;;
    # For Windows
    CYGWIN*|MINGW32*|MSYS*|MINGW*)
      CHECK_RESULT=`netsh firewall show state`
      if [[ $CHECK_RESULT =~ "Status: inactive" ]]; then
        echo "Check result:   ${1}              $(print_ok)"
        echo "Firewall is disable, so that all ports are opened."
      elif [[ $CHECK_RESULT =~ "${1}" ]]; then
        echo "Check result:   ${1}              $(print_ok)"
      else
        echo "Check result:   ${1}              $(print_error)"
        print_error "Please open port ${1}/tcp in Windows Defender Firewall"
      fi
      ;;
    # Other OS 
    *)
      CHECK_RESULT=`lsof -i:${1}`
      if [[ $CHECK_RESULT =~ "Status: inactive" ]]; then
        echo "Check result:   ${1}              $(print_ok)"
        echo "Firewall is disable, so that all ports are opened."
      elif [[ $CHECK_RESULT =~ "${1}/tcp" ]]; then
        echo "Check result:   ${1}              $(print_ok)"
      else
        echo "Check result:   ${1}              $(print_error)"
        print_error "Please open port by run: sudo ufw allow ${1}/tcp"
      fi
      ;;
  esac
}

# ============ Script to check folder permission ============
echo "-------------   Folder permission check  -------------"
case "$(uname -s)" in
  # For Mac OS
   Darwin)
     DATA_PERMISSION=`stat -f "%OLp" ./chain-data/`
     ;;
  # For Ubuntu
   Linux)
     DATA_PERMISSION=`stat -c "%a" chain-data`
     ;;
  # For Windows
   CYGWIN*|MINGW32*|MSYS*|MINGW*)
     DATA_PERMISSION=`stat -c "%a" chain-data`
     ;;
   # Other OS 
   *)
     DATA_PERMISSION=`stat -c "%a" chain-data`
     ;;
esac

if [ $DATA_PERMISSION -eq 777 ]; then
  echo "Check result:   ./chain-data          $(print_ok)"
else
  echo "Check result:   ./chain-data          $(print_error)"
  print_error "Please change chain-data folder permission to 777 by run: chmod -R 777 ./chain-data"
fi
echo ""

# ============ Script to check NTP Time Server on host ============
echo "-------------   NTP Time Server check    -------------"
case "$(uname -s)" in
  # For Mac OS
  Darwin)
    NTP_SERVER=`sntp 127.0.0.1`
    ;;
  # For Ubuntu
  Linux)
    NTP_SERVER=`timedatectl`
    ;;
  # For Windows
  CYGWIN*|MINGW32*|MSYS*|MINGW*)
    NTP_SERVER=`w32tm //query //peers`
    ;;
  # Other OS 
  *)
    NTP_SERVER=`ntpq -p`
    ;;
esac

if [[ -z "$NTP_SERVER" ]]; then
  echo "Check result:   NTP_SERVER             $(print_error)"
  print_error "Please install NTP Time Server"
  print_error "by refering: ./docs/how_to_fix_environment_errors.md"
elif [[ $NTP_SERVER =~ "no UCST response" ]]; then
  echo "Check result:   NTP_SERVER            $(print_error)"
  print_error "Please reconfig your NTP Time Server or recheck Server IP"
    print_error "by refering: ./docs/how_to_fix_environment_errors.md"
elif [[ $NTP_SERVER =~ "The service has not been started" ]]; then
  echo "Check result:   NTP_SERVER            $(print_error)"
  print_error "Please reconfig your NTP Time Server"
  print_error "by refering: ./docs/how_to_fix_environment_errors.md"
elif [[ $NTP_SERVER =~ "systemd-timesyncd.service active: no" ]]; then
  echo "Check result:   NTP_SERVER            $(print_error)"
  print_error "Please reconfig your NTP Time Server"
  print_error "by refering: ./docs/how_to_fix_environment_errors.md"
else
  echo "Check result:   NTP_SERVER            $(print_ok)"
fi
echo ""

# ============ Script to check opened port ============ 
case "$1" in
  # For full node
  --full)
    echo "-------------   Opened port check for full node       -------------"

    WS_PORT_NUMBER=9944
    echo "$(check_port $WS_PORT_NUMBER)"

    RPC_PORT_NUMBER=9933
    echo "$(check_port $RPC_PORT_NUMBER)"

    P2P_PORT_NUMBER=30333
    echo "$(check_port $P2P_PORT_NUMBER)"
    ;;
  # For validator node
  --validator|"")
    echo "-------------   Opened port check for validator node       -------------"

    P2P_PORT_NUMBER=30333
    echo "$(check_port $P2P_PORT_NUMBER)"
    ;;
  # For validator node or other node
  *)
    echo "-------------   Opened port check       -------------"
    print_error "Wrong parameter, please use right parmameter!"
    ;;
esac
