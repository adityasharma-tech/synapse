FROM node:22-alpine AS base

WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN mkdir apps packages

COPY ./apps/server/package.json ./apps/server/
COPY ./apps/web/package.json ./apps/web/

COPY ./packages/zod-client/package.json ./packages/zod-client/
COPY ./packages/drizzle-client/package.json ./packages/drizzle-client/

RUN yarn install

COPY *.json .

RUN ls -l
RUN ls ./apps/server -l

COPY ./apps/server ./apps/server
COPY ./apps/web ./apps/web

COPY ./packages/zod-client ./packages/zod-client
COPY ./packages/drizzle-client ./packages/drizzle-client

RUN ls -l

RUN yarn build

CMD [ "yarn", "dev" ]