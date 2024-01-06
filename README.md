## Description

[Nest](https://github.com/nestjs/nest) application example involing microservices, restful api, chat, jwt auth, mongo, docker, dto, validation, socket io, rabbitmq queue, swagger, kong & unit tests.

## Installation

```bash
$ npm install
$ docker-compose pull
```

## List of sub apps
- api (main api)
- auth (authentication endpoint)
- stream (consumer & socket io server)

## Running the app

```bash
# development
$ npm run start [<app>]

# watch mode
$ npm run start:dev [<app>]

# production mode
$ npm run start:prod [<app>]
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
Available at `http://localhost:3001` after api instance is running.

Because of incapability of swagging websocket, you can try it on my [Postman workspace](https://www.postman.com/blue-crescent-479369/workspace/yanuar-s-space)

