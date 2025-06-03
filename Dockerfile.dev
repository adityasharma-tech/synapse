FROM node:22 AS builder

WORKDIR /home/build

RUN apt update -y

RUN corepack enable yarn

RUN apt install nginx -y
RUN yarn global add pm2

COPY package.json .
COPY yarn.lock .

RUN yarn install

COPY . .
RUN yarn clean

RUN yarn

RUN yarn build:packages
RUN yarn build:apps

COPY nginx.conf .
RUN mv nginx.conf /etc/nginx/nginx.conf

RUN nginx -t

RUN mkdir /www /www/root

RUN mv ./apps/web/dist/* /www/root

CMD ["bash", "-c", "nginx && yarn start"]