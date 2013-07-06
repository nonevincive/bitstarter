#!/bin/bash

# Install a special packages
sudo apt-get install -y python-software-properties python g++ make
sudo add-apt-repository ppa:chris-lea/node.js
sudo apt-get update
sudo apt-get install -y nodejs

# Setup Heroku
wget -qO- https://toolbelt.heroku.com/install-ubuntu.sh | sh
heroku login
ssh-keygen -t rsa
heroku keys:add
heroku create
git push heroku master

# Bash setup
echo "alias e='vi'" >> ~/.bashrc
source ../.bashrc
