FROM foxbarrington/xpra-wine-focal:latest

ENV DEBIAN_FRONTEND noninteractive
ENV PORT 8080

WORKDIR /

RUN dpkg --add-architecture i386 && \
    apt-get update -y && \
    apt-get update && apt-get install -y ca-certificates curl gnupg && \
    mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg && \
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x focal main" > /etc/apt/sources.list.d/nodesource.list && \
    apt-get update && apt-get install nodejs -y

COPY ./server.js .
COPY ./package.json .
COPY ./package-lock.json .
RUN npm install

EXPOSE 8080
CMD ["node", "server.js"]

# CMD ["/bin/bash"]



