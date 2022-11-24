FROM node:14.3.0
USER root

WORKDIR /app

RUN apt-get install -y gcc make

RUN npm install -g node-gyp

# Get sources
# Make sure the correct branch/release is used here!
# RUN git clone https://github.com/data-intuitive/LuciusWeb
COPY . /app/LuciusWeb/

WORKDIR /app/LuciusWeb

# LuciusWeb
RUN npm install
RUN npm run build

# Port to expose
EXPOSE 80

# RUN
CMD /usr/local/bin/node server.js
