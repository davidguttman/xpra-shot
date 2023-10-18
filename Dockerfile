FROM ubuntu:20.04

ENV DEBIAN_FRONTEND noninteractive
ENV PORT 8080

WORKDIR /

RUN dpkg --add-architecture i386 && \
    apt-get update -y && \
    apt-get install -y xdotool wget curl unzip ca-certificates xvfb x11-xserver-utils python3-pip && \
    pip3 install pyinotify python-uinput && \
    apt-get update && apt-get install -y ca-certificates curl gnupg && \
    mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg && \
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x focal main" > /etc/apt/sources.list.d/nodesource.list && \
    apt-get update && apt-get install nodejs -y && \
    echo "deb https://xpra.org/ focal main" >> /etc/apt/sources.list && \
    wget -q https://xpra.org/gpg.asc -O- | apt-key add - && \
    apt update && \
    apt install -y xpra=4.4.6-r29-1

COPY ./server.js .
COPY ./package.json .
COPY ./package-lock.json .
RUN npm install

EXPOSE 8080
CMD ["node", "server.js"]

# CMD ["/bin/bash"]



