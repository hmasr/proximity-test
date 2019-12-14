#!/bin/bash
if (( $EUID != 0 )); then
  echo "Please run as sudo"
  exit
fi

apt-get install -y bluetooth bluez libbluetooth-dev libudev-dev
