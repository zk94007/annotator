FROM node:9.3

RUN apt-get update && apt-get install -y apt-transport-https

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

RUN apt-get update && apt-get install -y yarn

COPY . /srv/client

WORKDIR /srv/client

RUN npm install -g gulp-cli
RUN npm install yarn

ENV SIDEBAR_APP_URL=http://h.local/app.html

EXPOSE 3000
EXPOSE 3001

RUN make