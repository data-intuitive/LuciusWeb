# Docker deploy of LuciusWeb

## Docker build based on CentOS 7

Use the `Dockerfile` in this directory to build the container with the latest sources:

```
docker build -t luciusweb .
```

In order to use RedHat as a base image, please make sure the correct lines are (un)commented 

Then the image can be run like so:

    docker run -d -p 3000:3000 luciusweb

By doing this, a new image is made. Multiple apps can run simultaneously on different host ports:

    docker run -d -p 3001:3000 luciusweb


## Docker build based on latest node

If you have the liberty of choosing your base image, you can start from the [official `node` image](https://hub.docker.com/_/node/) on the Docker Hub. Something like this should work, then:

```
FROM node:onbuild

EXPOSE 3000

RUN apt-get update
RUN apt-get install ruby -y
RUN gem install sass
RUN npm install -g bower
RUN npm install -g gulp

## Repo 
WORKDIR /root
RUN git clone https://github.com/data-intuitive/LuciusWeb

# LuciusWeb
RUN cd /root/LuciusWeb \
  && npm install \
  && bower install --allow-root

# RUN
CMD cd /root/LuciusWeb && gulp serve
```

The base image requires you to include a `package.json` file. You can simply use the one from the LuciusWeb root directory.

The docker build process picks up the luciusweb sources relative to the build path. Make sure the repo is on the correct branch for this and with the most recent upstream version.


## Manual Procedure for creating a docker container

You can use the following as a template for creating your own docker containers, for instance in case you need to base on a different base image.

### Node

    docker pull node
    docker run -i -t node bash

    apt-get update
    apt-get install ruby -y
    gem install sass
    npm install -g bower
    npm install -g gulp

    cd /root
    git clone ...
    cd ...
    npm install
    bower install --allow-root
    gulp serve

### docker commit

    docker commit .... luciusweb

### Run

    docker run -p 3000:3000 compass sh -c 'cd ... && gulp serve'


# FAQ

## Dependency resolution

In order for dependencies to be resolved automatically by Bower, you need to add this to the `bower.json` file under `luciusweb/frontend`

    "resolutions": {
      "webcomponentsjs": "~0.6.0"
    }


## Some more info on using `Boot2Docker` (Mac only)

    boot2docker start
    boot2docker shellinit
    eval "$(boot2docker shellinit)"
    docker run hello-world








