FROM ubuntu:20.04 AS builder

# LABEL about the custom image
LABEL maintainer="matias@freewaves.live"
LABEL version="0.1"
LABEL description="custom layer ubuntu image for homeservice"

# Disable Prompt During Packages Installation
ARG DEBIAN_FRONTEND=noninteractive

# update and add sudo
RUN apt update
RUN apt install -y sudo
# RUN apt-get update && \
#    apt-get -y install sudo

# create user "ubuntu"
RUN useradd -m ubuntu && echo "ubuntu:ubuntu" | chpasswd && adduser ubuntu sudo

# install required dependenies
RUN sudo apt install curl -yq && \
    sudo apt install cmake -yq

# install node.js
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash - && \
    sudo apt-get install -y nodejs && \
    # Update npm
    sudo npm install -g npm@8.1.4 && \
    # Install gitget
    sudo npm install -g gitget@latest


FROM builder
# switch to user ubuntu
USER ubuntu

# install get git homeservice
RUN cd /home/ubuntu && \
    sudo -u ubuntu gitget matigumma/homeservice && \
    cd homeservice && \
    sudo -u ubuntu npm install

# change the default directory
WORKDIR "/home/ubuntu/homeservice"

EXPOSE 3000
# CMD /bin/bash
CMD ["npm", "run", "serve"]