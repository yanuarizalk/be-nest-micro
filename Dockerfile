FROM node:20-alpine AS builder

ARG APP

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

RUN npm ci

COPY --chown=node:node . .

RUN npm run build ${APP}

USER node

FROM node:20-alpine

ARG APP

COPY --chown=node:node --from=builder /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=builder /usr/src/app/dist ./dist

RUN echo ${APP}

ENV DIST=dist/apps/${APP}/main.js
CMD node ${DIST}