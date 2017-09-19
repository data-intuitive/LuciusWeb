
#FROM rhel7:latest
FROM centos:7
USER root

# Fix per https://bugzilla.redhat.com/show_bug.cgi?id=1192200
RUN yum -y install deltarpm yum-utils --disablerepo=*-eus-* --disablerepo=*-htb-* --disablerepo=*-ha-* --disablerepo=*-rt-* --disablerepo=*-lb-* --disablerepo=*-rs-* --disablerepo=*-sap-*

RUN yum-config-manager --disable *-eus-* *-htb-* *-ha-* *-rt-* *-lb-* *-rs-* *-sap-* > /dev/null

# Update image and install necessary packages
RUN yum update -y

# Prepare for node.js install and install (per https://nodejs.org/en/download/package-manager/)
RUN curl --silent --location https://rpm.nodesource.com/setup | bash -
RUN yum -y install nodejs
RUN npm -g install npm@latest
RUN yum -y install gcc-c++ make

# Further deps
RUN yum -y install git bzip2 libpng-devel
RUN yum -y install ruby
RUN gem install sass
RUN npm install -g bower
RUN npm install -g gulp

WORKDIR /root

# Get sources
# Make sure the correct branch/release is used here!
RUN git clone https://github.com/data-intuitive/LuciusWeb

# LuciusWeb
RUN cd /root/LuciusWeb \
  && npm install \
  && bower install --allow-root

# Port to expose
EXPOSE 3000

# RUN
CMD cd /root/LuciusWeb && gulp serve