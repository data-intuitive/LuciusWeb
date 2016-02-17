
# Boot2Docker (Mac only)

    boot2docker start
    boot2docker shellinit
    eval "$(boot2docker shellinit)"
    docker run hello-world

# Manual

## Node

    docker pull node
    docker run -i -t node bash

    apt-get update
    apt-get install ruby -y
    gem install sass
    npm install -g bower
    npm install -g gulp

    cd /root
    git clone https://bitbucket.org/vda-lab/luciusweb
    cd luciusweb/frontend
    git checkout develop
    npm install
    bower install --allow-root
    gulp serve

## docker commit

    docker commit .... compass

## Run

    docker run -p 3000:3000 compass sh -c 'cd /root/luciusweb/frontend && gulp serve'


# Build

Include `Dockerfile`:

```
FROM node:onbuild

EXPOSE 3000

RUN apt-get update
RUN apt-get install ruby -y
RUN gem install sass
RUN npm install -g bower
RUN npm install -g gulp

## Repo is password protected, gives issues...
# RUN cd /root ; git clone https://bitbucket.org/vda-lab/luciusweb
# RUN cd /root/luciusweb/frontend ; git checkout develop
## So, copy from local copy
ADD luciusweb /root/
RUN ls /root/
RUN cd /root/frontend ; npm install
RUN cd /root/frontend ; bower install --allow-root

CMD cd /root/frontend ; gulp serve
```

Include `package.json`:

```
{
  "name": "ComPass",
  "version": "0.1.0",
  "dependencies": {},
  "devDependencies": {
    "apache-server-configs": "^2.7.1",
    "browser-sync": "^1.3.0",
    "del": "^0.1.2",
    "gulp": "^3.8.5",
    "gulp-autoprefixer": "^0.0.8",
    "gulp-cache": "^0.2.2",
    "gulp-changed": "^1.0.0",
    "gulp-cssmin": "^0.1.6",
    "gulp-flatten": "^0.0.2",
    "gulp-if": "^1.2.1",
    "gulp-imagemin": "^1.0.0",
    "gulp-jshint": "^1.10.0",
    "gulp-load-plugins": "^0.5.3",
    "gulp-minify-html": "^0.1.4",
    "gulp-rename": "^1.2.0",
    "gulp-replace": "^0.4.0",
    "gulp-ruby-sass": "^0.7.1",
    "gulp-size": "^1.0.0",
    "gulp-uglify": "^0.3.1",
    "gulp-uncss": "^0.4.5",
    "gulp-useref": "^0.6.0",
    "gulp-vulcanize": "^5.0.0",
    "jshint-stylish": "^0.4.0",
    "merge-stream": "^0.1.6",
    "opn": "^1.0.0",
    "psi": "^1.0.4",
    "require-dir": "^0.1.0",
    "run-sequence": "^0.3.6"
  },
  "engines": {
    "node": ">=0.10.0"
  }
}
```

The docker build process picks up the luciusweb sources relative to the build path. Make sure the repo is on the correct branch for this and with the most recent upstream version.

    git clone https://bitbucket.org/vda-lab/luciusweb
    cd luciusweb
    git checkout develop

In order for dependencies to be resolved automatically by Bower, you need to add this to the `bower.json` file under `luciusweb/frontend`

    "resolutions": {
      "webcomponentsjs": "~0.6.0"
    }


and run:

    docker build compass-dev .


Then the image can be run like so:

    docker run -d -p 3000:3000 compass-dev

By doing this, a new image is made. Multiple apps can run simultaneously on different host ports:

    docker run -d -p 3001:3000 compass-dev










