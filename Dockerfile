# Set the base image
FROM keymetrics/pm2:8

# Set Maintainer
MAINTAINER A.L.K Thejitha "istore221@gmail.com"


# BUILD_ENV_VARS
ARG BUILD_ENV
ARG PORT

# ENV_VARS
ENV PORT $PORT
ENV BUILD_ENV $BUILD_ENV

# Install
RUN apk add --update --no-cache \
    yarn


# WORKDIR
WORKDIR /usr/share/app



# Bundle app source & Install app dependencies
ADD . .


# Install dependencies
RUN yarn install


# Start express
CMD pm2-docker start pm2.json --env $BUILD_ENV


# Expose ports
EXPOSE $PORT
