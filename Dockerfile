
FROM node
USER root

RUN apt-get update
RUN apt-get install gcc g++ build-essential

WORKDIR /app

# Get sources
# Make sure the correct branch/release is used here!
RUN git clone https://github.com/data-intuitive/LuciusWeb

WORKDIR /app/LuciusWeb

# LuciusWeb
RUN npm update && \
    npm install && \
    npm run build

# Port to expose
EXPOSE 80

# RUN
CMD /usr/local/bin/node server.js
#cd /root/LuciusWeb && npm run serve
