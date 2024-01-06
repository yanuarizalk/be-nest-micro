## Description

[Nest](https://github.com/nestjs/nest) application example involing microservices, restful api, chat, jwt auth, mongo, docker, dto, validation, file upload, socket io, rabbitmq queue, swagger, kong & unit tests.

## Installation

```bash
$ npm install
$ docker-compose pull
$ docker-compose build
```

## List of sub apps
- api (main api) :3001
- auth (authentication endpoint) :3002
- stream (consumer & socket io server) :3003

## Running the app
For testing purposes there's no need to setup yer env file.
If you got trouble with port conflicts, add .env file to root project according to these [configuration](./config/configuration.ts)
```bash
# run database & message broker instance
$ docker-compose up -d mongo rabbitmq

# development
$ npm run start [<app>]

# watch mode
$ npm run start:dev [<app>]

# production mode
$ npm run start:prod [<app>]

# or run as unified api through kong gateway
# and all api will have prefix /api & listen on port 8000
$ docker-compose up -d kong api auth stream

```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## API Documentation
OpenAPI format available at (Try On The Go)
- `http://localhost:3001` 
- `http://localhost:3002` 

make sure the instance is running.

Because of incapability of swagging websocket, you can try it on my [Postman workspace](https://www.postman.com/blue-crescent-479369/workspace/yanuar-s-space)

