
FROM node
USER root

WORKDIR /root

# Get sources
# Make sure the correct branch/release is used here!
RUN git clone https://github.com/data-intuitive/LuciusWeb -b v2

# LuciusWeb
RUN cd /root/LuciusWeb \
  && npm install

# Port to expose
EXPOSE 3000

# RUN
CMD cd /root/LuciusWeb && npm run serve