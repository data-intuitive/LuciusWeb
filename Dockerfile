FROM node:8
USER root

WORKDIR /app

RUN apt-get install -y gcc make

# Get sources
# Make sure the correct branch/release is used here!
RUN git clone https://github.com/data-intuitive/LuciusWeb

WORKDIR /app/LuciusWeb

RUN npm install -g node-gyp

# LuciusWeb
# RUN npm update
RUN npm install
RUN npm run build

# Port to expose
EXPOSE 80

# RUN
CMD /usr/local/bin/node server.js
