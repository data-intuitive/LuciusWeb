FROM node:14.3.0
USER root

WORKDIR /app

RUN apt-get install -y gcc make

# Get sources
# Make sure the correct branch/release is used here!
# RUN git clone https://github.com/data-intuitive/LuciusWeb
COPY . /app/LuciusWeb/

WORKDIR /app/LuciusWeb

RUN npm install -g node-gyp

# LuciusWeb
RUN npm install
RUN npm run build

# Copy the dist folder to the public folder so that it's available without exposing the root of the server data
RUN mv dist public

# Port to expose
EXPOSE 80

# RUN
CMD /usr/local/bin/node server.js
