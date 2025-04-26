FROM node:22-alpine AS builder

WORKDIR /home/build

COPY package.json .
COPY yarn.lock .

RUN mkdir apps packages

COPY ./apps/server/package.json ./apps/server/
COPY ./apps/web/package.json ./apps/web/

COPY ./packages/zod-client/package.json ./packages/zod-client/
COPY ./packages/drizzle-client/package.json ./packages/drizzle-client/

RUN yarn install


COPY *.json .

COPY ./apps/server ./apps/server
COPY ./apps/web ./apps/web

COPY ./packages/zod-client ./packages/zod-client
COPY ./packages/drizzle-client ./packages/drizzle-client

RUN yarn build:packages
RUN yarn build:apps

FROM builder AS runner

WORKDIR /home/app

COPY --from=builder /home/build/apps/server/dist /home/app/apps/server/dist
COPY --from=builder /home/build/apps/web/dist /home/app/apps/web/dist

COPY --from=builder /home/build/packages /home/app/packages

COPY --from=builder /home/build/package.json /home/app/

COPY --from=builder /home/build/node_modules /home/app/node_modules
COPY --from=builder /home/build/apps/server/node_modules /home/app/apps/server/node_modules
COPY --from=builder /home/build/apps/web/node_modules /home/app/apps/web/node_modules

CMD [ "yarn", "start" ]