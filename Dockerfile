FROM node:22-alpine AS base

WORKDIR /app

COPY . .

RUN yarn install

RUN yarn build

CMD [ "yarn", "dev" ]